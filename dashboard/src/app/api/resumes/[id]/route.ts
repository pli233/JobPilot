import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import fs from "fs/promises";
import path from "path";

// GET /api/resumes/[id] - Get PDF file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get resume from database
    const { data: resume, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Try to read the file
    try {
      const fileBuffer = await fs.readFile(resume.file_path);

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${path.basename(resume.file_path)}"`,
        },
      });
    } catch {
      return NextResponse.json(
        { error: "PDF file not found on disk" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error serving resume:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
