"use server";

import { db, applications, jobs, type Application, type NewApplication } from "@/lib/db";
import { eq, desc, and, gte, lte, count } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

export interface ApplicationWithJob {
  id: string;
  jobId: string | null;
  resumeId: string | null;
  status: string;
  appliedAt: Date | null;
  notes: string | null;
  screenshotPath: string | null;
  confirmationScreenshotPath: string | null;
  createdAt: Date;
  company: string | null;
  position: string | null;
  platform: string | null;
  url: string | null;
  // Extended fields
  resumeName: string | null;
  applicationUrl: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  location: string | null;
  locationType: string | null;
  demographicsSubmitted: boolean | null;
}

export async function getApplications(): Promise<ApplicationWithJob[]> {
  try {
    const result = await db
      .select({
        id: applications.id,
        jobId: applications.jobId,
        resumeId: applications.resumeId,
        status: applications.status,
        appliedAt: applications.appliedAt,
        notes: applications.notes,
        screenshotPath: applications.screenshotPath,
        confirmationScreenshotPath: applications.confirmationScreenshotPath,
        createdAt: applications.createdAt,
        company: jobs.company,
        position: jobs.title,
        platform: applications.platform,
        url: jobs.url,
        // Extended fields
        resumeName: applications.resumeName,
        applicationUrl: applications.applicationUrl,
        salaryMin: applications.salaryMin,
        salaryMax: applications.salaryMax,
        location: applications.location,
        locationType: applications.locationType,
        demographicsSubmitted: applications.demographicsSubmitted,
      })
      .from(applications)
      .leftJoin(jobs, eq(applications.jobId, jobs.id))
      .orderBy(desc(applications.appliedAt))
      .all();

    return result;
  } catch (error) {
    console.error("Failed to get applications:", error);
    return [];
  }
}

export async function getApplicationById(id: string): Promise<ApplicationWithJob | null> {
  try {
    const result = await db
      .select({
        id: applications.id,
        jobId: applications.jobId,
        resumeId: applications.resumeId,
        status: applications.status,
        appliedAt: applications.appliedAt,
        notes: applications.notes,
        screenshotPath: applications.screenshotPath,
        confirmationScreenshotPath: applications.confirmationScreenshotPath,
        createdAt: applications.createdAt,
        company: jobs.company,
        position: jobs.title,
        platform: applications.platform,
        url: jobs.url,
        // Extended fields
        resumeName: applications.resumeName,
        applicationUrl: applications.applicationUrl,
        salaryMin: applications.salaryMin,
        salaryMax: applications.salaryMax,
        location: applications.location,
        locationType: applications.locationType,
        demographicsSubmitted: applications.demographicsSubmitted,
      })
      .from(applications)
      .leftJoin(jobs, eq(applications.jobId, jobs.id))
      .where(eq(applications.id, id))
      .get();

    return result || null;
  } catch (error) {
    console.error("Failed to get application:", error);
    return null;
  }
}

export async function createApplication(
  data: Omit<NewApplication, "id" | "createdAt">
): Promise<Application | null> {
  try {
    const newApp: NewApplication = {
      ...data,
      id: nanoid(),
      createdAt: new Date(),
      appliedAt: data.appliedAt || new Date(),
    };

    await db.insert(applications).values(newApp);
    revalidatePath("/applications");
    revalidatePath("/");
    return newApp as Application;
  } catch (error) {
    console.error("Failed to create application:", error);
    return null;
  }
}

export async function updateApplicationStatus(
  id: string,
  status: string
): Promise<boolean> {
  try {
    await db
      .update(applications)
      .set({ status })
      .where(eq(applications.id, id));

    revalidatePath("/applications");
    revalidatePath("/");
    return true;
  } catch (error) {
    console.error("Failed to update application status:", error);
    return false;
  }
}

export async function updateApplicationNotes(
  id: string,
  notes: string
): Promise<boolean> {
  try {
    await db
      .update(applications)
      .set({ notes })
      .where(eq(applications.id, id));

    revalidatePath("/applications");
    return true;
  } catch (error) {
    console.error("Failed to update application notes:", error);
    return false;
  }
}

export async function deleteApplication(id: string): Promise<boolean> {
  try {
    await db.delete(applications).where(eq(applications.id, id));
    revalidatePath("/applications");
    revalidatePath("/");
    return true;
  } catch (error) {
    console.error("Failed to delete application:", error);
    return false;
  }
}

export async function getApplicationStats() {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Get all applications
    const allApps = await db.select().from(applications).all();

    // Calculate stats
    const total = allApps.length;
    const weekly = allApps.filter(
      (a) => a.appliedAt && new Date(a.appliedAt) >= weekAgo
    ).length;
    const lastWeekly = allApps.filter(
      (a) =>
        a.appliedAt &&
        new Date(a.appliedAt) >= twoWeeksAgo &&
        new Date(a.appliedAt) < weekAgo
    ).length;

    const interviews = allApps.filter((a) => a.status === "interview").length;
    const responded = allApps.filter(
      (a) => a.status !== "applied" && a.status !== "draft"
    ).length;

    const interviewRate = total > 0 ? Math.round((interviews / total) * 100) : 0;
    const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

    return {
      weekly,
      total,
      interviewRate,
      responseRate,
      weeklyChange: weekly - lastWeekly,
    };
  } catch (error) {
    console.error("Failed to get application stats:", error);
    return {
      weekly: 0,
      total: 0,
      interviewRate: 0,
      responseRate: 0,
      weeklyChange: 0,
    };
  }
}

export async function getRecentApplications(limit: number = 5) {
  try {
    const result = await db
      .select({
        id: applications.id,
        status: applications.status,
        appliedAt: applications.appliedAt,
        company: jobs.company,
        position: jobs.title,
      })
      .from(applications)
      .leftJoin(jobs, eq(applications.jobId, jobs.id))
      .orderBy(desc(applications.appliedAt))
      .limit(limit)
      .all();

    return result.map((r) => ({
      id: r.id,
      company: r.company || "Unknown",
      position: r.position || "Unknown",
      status: r.status,
      appliedAt: r.appliedAt || new Date(),
    }));
  } catch (error) {
    console.error("Failed to get recent applications:", error);
    return [];
  }
}
