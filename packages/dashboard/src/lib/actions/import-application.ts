"use server";

import { db, applications, jobs, type NewApplication, type NewJob } from "@/lib/db";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

/**
 * Application data received from Claude automation
 * This matches the data collected during a Greenhouse apply session
 */
export interface ImportApplicationData {
  // Job Info
  company: string;
  position: string;
  jobUrl: string;
  platform: "greenhouse" | "lever" | "workday" | "linkedin" | "other";
  location?: string;
  locationType?: "remote" | "hybrid" | "onsite";
  salaryMin?: number;
  salaryMax?: number;

  // Application Info
  resumeName: string;
  appliedAt: Date;
  status?: "applied" | "draft";
  notes?: string;

  // Screenshots
  previewScreenshotPath?: string;
  confirmationScreenshotPath?: string;

  // Demographics
  demographicsSubmitted?: boolean;
}

/**
 * Import an application from Claude automation
 * Creates both job and application records
 */
export async function importApplication(data: ImportApplicationData): Promise<{
  success: boolean;
  applicationId?: string;
  error?: string;
}> {
  try {
    // Check if job already exists by URL
    let existingJob = await db
      .select()
      .from(jobs)
      .where(eq(jobs.url, data.jobUrl))
      .get();

    let jobId: string;

    if (existingJob) {
      jobId = existingJob.id;
    } else {
      // Create new job record
      const newJob: NewJob = {
        id: nanoid(),
        platform: data.platform,
        title: data.position,
        company: data.company,
        location: data.location || null,
        locationType: data.locationType || null,
        salaryMin: data.salaryMin || null,
        salaryMax: data.salaryMax || null,
        url: data.jobUrl,
        savedAt: new Date(),
      };

      await db.insert(jobs).values(newJob);
      jobId = newJob.id;
    }

    // Create application record
    const newApplication: NewApplication = {
      id: nanoid(),
      jobId,
      status: data.status || "applied",
      appliedAt: data.appliedAt,
      notes: data.notes || null,
      screenshotPath: data.previewScreenshotPath || null,
      confirmationScreenshotPath: data.confirmationScreenshotPath || null,
      createdAt: new Date(),
      resumeName: data.resumeName,
      platform: data.platform,
      applicationUrl: data.jobUrl,
      salaryMin: data.salaryMin || null,
      salaryMax: data.salaryMax || null,
      location: data.location || null,
      locationType: data.locationType || null,
      demographicsSubmitted: data.demographicsSubmitted || false,
    };

    await db.insert(applications).values(newApplication);

    revalidatePath("/applications");
    revalidatePath("/");

    return {
      success: true,
      applicationId: newApplication.id,
    };
  } catch (error) {
    console.error("Failed to import application:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Batch import multiple applications
 */
export async function importApplicationsBatch(
  applications: ImportApplicationData[]
): Promise<{
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}> {
  let imported = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const app of applications) {
    const result = await importApplication(app);
    if (result.success) {
      imported++;
    } else {
      failed++;
      errors.push(`${app.company} - ${app.position}: ${result.error}`);
    }
  }

  return {
    success: failed === 0,
    imported,
    failed,
    errors,
  };
}

/**
 * Quick add application from Claude - minimal data
 * Used right after a successful application submission
 */
export async function quickAddApplication(data: {
  company: string;
  position: string;
  jobUrl: string;
  resumeName: string;
  platform?: string;
  location?: string;
  salaryRange?: string; // e.g., "$120,000 - $150,000"
  previewScreenshot?: string;
  confirmationScreenshot?: string;
}): Promise<{ success: boolean; applicationId?: string; error?: string }> {
  // Parse salary range if provided
  let salaryMin: number | undefined;
  let salaryMax: number | undefined;

  if (data.salaryRange) {
    const matches = data.salaryRange.match(/\$?([\d,]+)/g);
    if (matches && matches.length >= 2) {
      salaryMin = parseInt(matches[0].replace(/[$,]/g, ""));
      salaryMax = parseInt(matches[1].replace(/[$,]/g, ""));
    }
  }

  // Detect platform from URL
  let platform: "greenhouse" | "lever" | "workday" | "linkedin" | "other" = "other";
  if (data.jobUrl.includes("greenhouse.io")) platform = "greenhouse";
  else if (data.jobUrl.includes("lever.co")) platform = "lever";
  else if (data.jobUrl.includes("workday")) platform = "workday";
  else if (data.jobUrl.includes("linkedin.com")) platform = "linkedin";
  else if (data.platform) platform = data.platform as typeof platform;

  // Detect location type
  let locationType: "remote" | "hybrid" | "onsite" | undefined;
  if (data.location) {
    const loc = data.location.toLowerCase();
    if (loc.includes("remote")) locationType = "remote";
    else if (loc.includes("hybrid")) locationType = "hybrid";
    else locationType = "onsite";
  }

  return importApplication({
    company: data.company,
    position: data.position,
    jobUrl: data.jobUrl,
    platform,
    location: data.location,
    locationType,
    salaryMin,
    salaryMax,
    resumeName: data.resumeName,
    appliedAt: new Date(),
    status: "applied",
    previewScreenshotPath: data.previewScreenshot,
    confirmationScreenshotPath: data.confirmationScreenshot,
    demographicsSubmitted: true,
  });
}
