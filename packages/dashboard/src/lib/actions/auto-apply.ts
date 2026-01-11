"use server";

import { prepareAutoApply, type ApplyInstructions } from "@/lib/services/auto-apply";
import { db, applications, jobs } from "@/lib/db";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

export interface AutoApplyResult {
  success: boolean;
  instructions: ApplyInstructions | null;
  applicationId: string | null;
  error?: string;
}

export async function initiateAutoApply(
  jobId: string,
  resumeId?: string
): Promise<AutoApplyResult> {
  try {
    // Get job details
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, jobId),
    });

    if (!job) {
      return {
        success: false,
        instructions: null,
        applicationId: null,
        error: "Job not found",
      };
    }

    // Prepare auto-apply data
    const instructions = await prepareAutoApply(job.url);

    if (!instructions) {
      return {
        success: false,
        instructions: null,
        applicationId: null,
        error: "Failed to prepare auto-apply data",
      };
    }

    // Create application record with "applying" status
    const applicationId = nanoid();
    await db.insert(applications).values({
      id: applicationId,
      jobId: job.id,
      resumeId: resumeId || null,
      status: "applied",
      createdAt: new Date(),
      appliedAt: new Date(),
      notes: `Auto-apply initiated at ${new Date().toISOString()}`,
      screenshotPath: instructions.screenshotPath,
    });

    revalidatePath("/applications");
    revalidatePath("/jobs");

    return {
      success: true,
      instructions,
      applicationId,
    };
  } catch (error) {
    console.error("Auto-apply initiation failed:", error);
    return {
      success: false,
      instructions: null,
      applicationId: null,
      error: "Failed to initiate auto-apply",
    };
  }
}

export async function updateAutoApplyStatus(
  applicationId: string,
  status: "applied" | "interviewing" | "offered" | "rejected",
  notes?: string
): Promise<boolean> {
  try {
    await db
      .update(applications)
      .set({
        status,
        notes: notes || undefined,
      })
      .where(eq(applications.id, applicationId));

    revalidatePath("/applications");
    return true;
  } catch (error) {
    console.error("Failed to update auto-apply status:", error);
    return false;
  }
}
