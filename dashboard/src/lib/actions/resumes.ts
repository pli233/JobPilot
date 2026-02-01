"use server";

import { createClient } from "@/lib/supabase/server";
import type { Resume, NewResume } from "@/lib/supabase/types";
import { revalidatePath } from "next/cache";
import path from "path";
import fs from "fs/promises";

const RESUMES_DIR = path.resolve(process.cwd(), "../data/resumes");

export async function getResumes(): Promise<Resume[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to get resumes:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Failed to get resumes:", error);
    return [];
  }
}

export async function getDefaultResume(): Promise<Resume | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("is_default", true)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Failed to get default resume:", error);
      return null;
    }

    return data || null;
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
    const supabase = await createClient();

    // Check if this is the first resume
    const { count } = await supabase
      .from("resumes")
      .select("*", { count: "exact", head: true });

    const isFirst = (count || 0) === 0;
    const filePath = path.join(RESUMES_DIR, fileName);

    const newResume: NewResume = {
      name,
      file_path: filePath,
      skills: skills || null,
      is_default: isFirst,
    };

    const { data, error } = await supabase
      .from("resumes")
      .insert(newResume)
      .select()
      .single();

    if (error) {
      console.error("Failed to create resume:", error);
      return null;
    }

    revalidatePath("/resumes");
    return data;
  } catch (error) {
    console.error("Failed to create resume:", error);
    return null;
  }
}

export async function setDefaultResume(id: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    // First, unset all defaults
    const { error: unsetError } = await supabase
      .from("resumes")
      .update({ is_default: false })
      .neq("id", id);

    if (unsetError) {
      console.error("Failed to unset default resumes:", unsetError);
      return false;
    }

    // Then set the new default
    const { error } = await supabase
      .from("resumes")
      .update({ is_default: true })
      .eq("id", id);

    if (error) {
      console.error("Failed to set default resume:", error);
      return false;
    }

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
    const supabase = await createClient();

    const { error } = await supabase
      .from("resumes")
      .update({ skills })
      .eq("id", id);

    if (error) {
      console.error("Failed to update resume skills:", error);
      return false;
    }

    revalidatePath("/resumes");
    return true;
  } catch (error) {
    console.error("Failed to update resume skills:", error);
    return false;
  }
}

export async function deleteResume(id: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    // Get resume info first
    const { data: resume } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", id)
      .single();

    if (!resume) return false;

    // Delete from database
    const { error } = await supabase
      .from("resumes")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete resume:", error);
      return false;
    }

    // Try to delete file (don't fail if file doesn't exist)
    try {
      await fs.unlink(resume.file_path);
    } catch {
      // File might not exist, that's ok
    }

    // If this was the default, set another as default
    if (resume.is_default) {
      const { data: remaining } = await supabase
        .from("resumes")
        .select("id")
        .limit(1);

      if (remaining && remaining.length > 0) {
        await supabase
          .from("resumes")
          .update({ is_default: true })
          .eq("id", remaining[0].id);
      }
    }

    revalidatePath("/resumes");
    return true;
  } catch (error) {
    console.error("Failed to delete resume:", error);
    return false;
  }
}
