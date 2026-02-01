import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

const RESUMES_DIR = path.resolve(process.cwd(), "../data/resumes");

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const name = formData.get("name") as string | null;
    const skills = formData.get("skills") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: "No name provided" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Ensure directory exists
    await fs.mkdir(RESUMES_DIR, { recursive: true });

    // Generate filename
    const fileName = `${name.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}.pdf`;
    const filePath = path.join(RESUMES_DIR, fileName);

    // Write file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Check if this is the first resume
    const { count } = await supabase
      .from("resumes")
      .select("*", { count: "exact", head: true });

    const isFirst = (count || 0) === 0;

    // Create database record
    const { data: newResume, error } = await supabase
      .from("resumes")
      .insert({
        name,
        file_path: filePath,
        skills: skills || null,
        is_default: isFirst,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating resume record:", error);
      return NextResponse.json(
        { error: "Failed to create resume record" },
        { status: 500 }
      );
    }

    revalidatePath("/resumes");

    return NextResponse.json({
      success: true,
      resume: newResume,
    });
  } catch (error) {
    console.error("Error uploading resume:", error);
    return NextResponse.json(
      { error: "Failed to upload resume" },
      { status: 500 }
    );
  }
}
