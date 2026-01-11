import { NextRequest, NextResponse } from "next/server";
import { db, resumes } from "@/lib/db";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

// GET /api/resumes/[id] - Get PDF file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get resume from database
    const resume = await db
      .select()
      .from(resumes)
      .where(eq(resumes.id, id))
      .get();

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Try to read the file
    try {
      const fileBuffer = await fs.readFile(resume.filePath);

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${path.basename(resume.filePath)}"`,
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
