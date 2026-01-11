import { NextRequest, NextResponse } from "next/server";
import { db, resumes, type NewResume } from "@/lib/db";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

const RESUMES_DIR = path.resolve(process.cwd(), "../../data/resumes");

export async function POST(request: NextRequest) {
  try {
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
    const existing = await db.select().from(resumes).all();
    const isFirst = existing.length === 0;

    // Create database record
    const newResume: NewResume = {
      id: nanoid(),
      name,
      filePath,
      skills: skills || null,
      isDefault: isFirst,
      createdAt: new Date(),
    };

    await db.insert(resumes).values(newResume);
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
