import { NextRequest, NextResponse } from "next/server";
import { db, applications, jobs } from "@/lib/db";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function GET() {
  try {
    const allApplications = await db
      .select({
        id: applications.id,
        jobId: applications.jobId,
        resumeId: applications.resumeId,
        status: applications.status,
        appliedAt: applications.appliedAt,
        notes: applications.notes,
        screenshotPath: applications.screenshotPath,
        createdAt: applications.createdAt,
        // Join with jobs table
        company: jobs.company,
        position: jobs.title,
        platform: jobs.platform,
        url: jobs.url,
      })
      .from(applications)
      .leftJoin(jobs, eq(applications.jobId, jobs.id))
      .all();

    return NextResponse.json(allApplications);
  } catch (error) {
    console.error("Failed to fetch applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newApplication = {
      id: nanoid(),
      jobId: body.jobId,
      resumeId: body.resumeId || null,
      status: body.status || "applied",
      appliedAt: body.appliedAt ? new Date(body.appliedAt) : new Date(),
      notes: body.notes || null,
      screenshotPath: body.screenshotPath || null,
      createdAt: new Date(),
    };

    await db.insert(applications).values(newApplication);
    return NextResponse.json(newApplication, { status: 201 });
  } catch (error) {
    console.error("Failed to create application:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Application ID required" },
        { status: 400 }
      );
    }

    await db
      .update(applications)
      .set(updates)
      .where(eq(applications.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update application:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Application ID required" },
        { status: 400 }
      );
    }

    await db.delete(applications).where(eq(applications.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete application:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
