import { NextRequest, NextResponse } from "next/server";
import { db, jobs } from "@/lib/db";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function GET() {
  try {
    const allJobs = await db.select().from(jobs).all();
    return NextResponse.json(allJobs);
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newJob = {
      id: nanoid(),
      platform: body.platform,
      title: body.title,
      company: body.company,
      location: body.location || null,
      locationType: body.locationType || null,
      salaryMin: body.salaryMin || null,
      salaryMax: body.salaryMax || null,
      url: body.url,
      description: body.description || null,
      easyApply: body.easyApply || false,
      matchScore: body.matchScore || null,
      savedAt: new Date(),
    };

    await db.insert(jobs).values(newJob);
    return NextResponse.json(newJob, { status: 201 });
  } catch (error) {
    console.error("Failed to save job:", error);
    return NextResponse.json({ error: "Failed to save job" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Job ID required" }, { status: 400 });
    }

    await db.delete(jobs).where(eq(jobs.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete job:", error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}
