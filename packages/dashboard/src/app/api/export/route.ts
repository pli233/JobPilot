import { NextResponse } from "next/server";
import { db, applications, jobs } from "@/lib/db";
import { eq } from "drizzle-orm";

// This API route prepares data for Excel export
// The actual Excel writing will be done via the Excel MCP
export async function GET() {
  try {
    const allApplications = await db
      .select({
        id: applications.id,
        status: applications.status,
        appliedAt: applications.appliedAt,
        notes: applications.notes,
        company: jobs.company,
        position: jobs.title,
        platform: jobs.platform,
        url: jobs.url,
        location: jobs.location,
        salaryMin: jobs.salaryMin,
        salaryMax: jobs.salaryMax,
      })
      .from(applications)
      .leftJoin(jobs, eq(applications.jobId, jobs.id))
      .all();

    // Format data for Excel export
    const excelData = [
      [
        "ID",
        "Date",
        "Platform",
        "Company",
        "Position",
        "Location",
        "Salary Range",
        "Status",
        "URL",
        "Notes",
      ],
      ...allApplications.map((app) => [
        app.id,
        app.appliedAt ? new Date(app.appliedAt).toISOString().split("T")[0] : "",
        app.platform || "",
        app.company || "",
        app.position || "",
        app.location || "",
        app.salaryMin && app.salaryMax
          ? `$${app.salaryMin / 1000}k - $${app.salaryMax / 1000}k`
          : "",
        app.status,
        app.url || "",
        app.notes || "",
      ]),
    ];

    return NextResponse.json({
      data: excelData,
      filename: `job_applications_${new Date().toISOString().split("T")[0]}.xlsx`,
    });
  } catch (error) {
    console.error("Failed to prepare export data:", error);
    return NextResponse.json(
      { error: "Failed to prepare export data" },
      { status: 500 }
    );
  }
}
