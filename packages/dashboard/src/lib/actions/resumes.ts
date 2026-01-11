"use server";

import { db, resumes, type Resume, type NewResume } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import path from "path";
import fs from "fs/promises";

const RESUMES_DIR = path.resolve(process.cwd(), "../../data/resumes");

export async function getResumes(): Promise<Resume[]> {
  try {
    const result = await db
      .select()
      .from(resumes)
      .orderBy(desc(resumes.createdAt))
      .all();
    return result;
  } catch (error) {
    console.error("Failed to get resumes:", error);
    return [];
  }
}

export async function getDefaultResume(): Promise<Resume | null> {
  try {
    const result = await db
      .select()
      .from(resumes)
      .where(eq(resumes.isDefault, true))
      .get();
    return result || null;
  } catch (error) {
    console.error("Failed to get default resume:", error);
    return null;
  }
}

export async function createResume(
  name: string,
  fileName: string,
  skills?: string
): Promise<Resume | null> {
  try {
    // Check if this is the first resume
    const existing = await db.select().from(resumes).all();
    const isFirst = existing.length === 0;

    const filePath = path.join(RESUMES_DIR, fileName);

    const newResume: NewResume = {
      id: nanoid(),
      name,
      filePath,
      skills: skills || null,
      isDefault: isFirst,
      createdAt: new Date(),
    };

    await db.insert(resumes).values(newResume);
    revalidatePath("/resumes");
    return newResume as Resume;
  } catch (error) {
    console.error("Failed to create resume:", error);
    return null;
  }
}

export async function setDefaultResume(id: string): Promise<boolean> {
  try {
    // First, unset all defaults
    await db.update(resumes).set({ isDefault: false });

    // Then set the new default
    await db.update(resumes).set({ isDefault: true }).where(eq(resumes.id, id));

    revalidatePath("/resumes");
    return true;
  } catch (error) {
    console.error("Failed to set default resume:", error);
    return false;
  }
}

export async function updateResumeSkills(
  id: string,
  skills: string
): Promise<boolean> {
  try {
    await db.update(resumes).set({ skills }).where(eq(resumes.id, id));
    revalidatePath("/resumes");
    return true;
  } catch (error) {
    console.error("Failed to update resume skills:", error);
    return false;
  }
}

export async function deleteResume(id: string): Promise<boolean> {
  try {
    const resume = await db
      .select()
      .from(resumes)
      .where(eq(resumes.id, id))
      .get();

    if (!resume) return false;

    // Delete from database
    await db.delete(resumes).where(eq(resumes.id, id));

    // Try to delete file (don't fail if file doesn't exist)
    try {
      await fs.unlink(resume.filePath);
    } catch {
      // File might not exist, that's ok
    }

    // If this was the default, set another as default
    if (resume.isDefault) {
      const remaining = await db.select().from(resumes).limit(1).all();
      if (remaining.length > 0) {
        await db
          .update(resumes)
          .set({ isDefault: true })
          .where(eq(resumes.id, remaining[0].id));
      }
    }

    revalidatePath("/resumes");
    return true;
  } catch (error) {
    console.error("Failed to delete resume:", error);
    return false;
  }
}
