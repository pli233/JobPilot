"use server";

import { db, applications, jobs } from "@/lib/db";
import { eq } from "drizzle-orm";
import path from "path";

const DATA_DIR = path.resolve(process.cwd(), "../../data");

export interface ExportData {
  headers: string[];
  rows: (string | number | null)[][];
  filename: string;
  filepath: string;
}

export async function prepareApplicationsExport(): Promise<ExportData> {
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

    const headers = [
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
    ];

    const rows = allApplications.map((app) => [
      app.id,
      app.appliedAt
        ? new Date(app.appliedAt).toISOString().split("T")[0]
        : "",
      app.platform || "",
      app.company || "",
      app.position || "",
      app.location || "",
      app.salaryMin && app.salaryMax
        ? `$${Math.round(app.salaryMin / 1000)}k - $${Math.round(app.salaryMax / 1000)}k`
        : "",
      app.status,
      app.url || "",
      app.notes || "",
    ]);

    const filename = `job_applications_${new Date().toISOString().split("T")[0]}.xlsx`;
    const filepath = path.join(DATA_DIR, filename);

    return {
      headers,
      rows,
      filename,
      filepath,
    };
  } catch (error) {
    console.error("Failed to prepare export data:", error);
    return {
      headers: [],
      rows: [],
      filename: "",
      filepath: "",
    };
  }
}

export async function prepareSavedJobsExport(): Promise<ExportData> {
  try {
    const allJobs = await db.select().from(jobs).all();

    const headers = [
      "ID",
      "Platform",
      "Company",
      "Position",
      "Location",
      "Location Type",
      "Salary Min",
      "Salary Max",
      "Easy Apply",
      "Match Score",
      "Saved At",
      "URL",
    ];

    const rows = allJobs.map((job) => [
      job.id,
      job.platform,
      job.company,
      job.title,
      job.location || "",
      job.locationType || "",
      job.salaryMin || "",
      job.salaryMax || "",
      job.easyApply ? "Yes" : "No",
      job.matchScore || "",
      job.savedAt
        ? new Date(job.savedAt).toISOString().split("T")[0]
        : "",
      job.url,
    ]);

    const filename = `saved_jobs_${new Date().toISOString().split("T")[0]}.xlsx`;
    const filepath = path.join(DATA_DIR, filename);

    return {
      headers,
      rows,
      filename,
      filepath,
    };
  } catch (error) {
    console.error("Failed to prepare saved jobs export:", error);
    return {
      headers: [],
      rows: [],
      filename: "",
      filepath: "",
    };
  }
}

// This returns data formatted for Excel MCP to write
export async function getExcelExportData(type: "applications" | "jobs") {
  const exportData =
    type === "applications"
      ? await prepareApplicationsExport()
      : await prepareSavedJobsExport();

  return {
    data: [exportData.headers, ...exportData.rows],
    filepath: path.join(DATA_DIR, "job_tracker.xlsx"),
    sheet_name: type === "applications" ? "Applications" : "Saved Jobs",
  };
}
