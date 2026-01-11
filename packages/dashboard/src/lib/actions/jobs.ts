"use server";

import { db, jobs, type Job, type NewJob } from "@/lib/db";
import { eq, desc, like, or, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

export async function getJobs(filters?: {
  platform?: string;
  locationType?: string;
  search?: string;
}): Promise<Job[]> {
  try {
    let query = db.select().from(jobs);

    const conditions = [];

    if (filters?.platform && filters.platform !== "all") {
      conditions.push(eq(jobs.platform, filters.platform));
    }

    if (filters?.locationType && filters.locationType !== "all") {
      conditions.push(eq(jobs.locationType, filters.locationType));
    }

    if (filters?.search) {
      conditions.push(
        or(
          like(jobs.title, `%${filters.search}%`),
          like(jobs.company, `%${filters.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const result = await query.orderBy(desc(jobs.savedAt)).all();
    return result;
  } catch (error) {
    console.error("Failed to get jobs:", error);
    return [];
  }
}

export async function getJobById(id: string): Promise<Job | null> {
  try {
    const result = await db.select().from(jobs).where(eq(jobs.id, id)).get();
    return result || null;
  } catch (error) {
    console.error("Failed to get job:", error);
    return null;
  }
}

export async function saveJob(job: Omit<NewJob, "id" | "savedAt">): Promise<Job | null> {
  try {
    const newJob: NewJob = {
      ...job,
      id: nanoid(),
      savedAt: new Date(),
    };

    await db.insert(jobs).values(newJob);
    revalidatePath("/jobs");
    return newJob as Job;
  } catch (error) {
    console.error("Failed to save job:", error);
    return null;
  }
}

export async function saveJobsBatch(jobList: Omit<NewJob, "id" | "savedAt">[]): Promise<number> {
  try {
    const newJobs = jobList.map((job) => ({
      ...job,
      id: nanoid(),
      savedAt: new Date(),
    }));

    await db.insert(jobs).values(newJobs);
    revalidatePath("/jobs");
    return newJobs.length;
  } catch (error) {
    console.error("Failed to save jobs batch:", error);
    return 0;
  }
}

export async function deleteJob(id: string): Promise<boolean> {
  try {
    await db.delete(jobs).where(eq(jobs.id, id));
    revalidatePath("/jobs");
    return true;
  } catch (error) {
    console.error("Failed to delete job:", error);
    return false;
  }
}

export async function updateJobMatchScore(id: string, score: number): Promise<boolean> {
  try {
    await db.update(jobs).set({ matchScore: score }).where(eq(jobs.id, id));
    revalidatePath("/jobs");
    return true;
  } catch (error) {
    console.error("Failed to update match score:", error);
    return false;
  }
}
