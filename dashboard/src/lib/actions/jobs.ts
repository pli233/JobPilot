"use server";

import { createClient } from "@/lib/supabase/server";
import type { Job, NewJob } from "@/lib/supabase/types";
import { revalidatePath } from "next/cache";

export async function getJobs(filters?: {
  platform?: string;
  locationType?: string;
  search?: string;
}): Promise<Job[]> {
  try {
    const supabase = await createClient();
    let query = supabase.from("jobs").select("*");

    if (filters?.platform && filters.platform !== "all") {
      query = query.eq("platform", filters.platform);
    }

    if (filters?.locationType && filters.locationType !== "all") {
      query = query.eq("location_type", filters.locationType as "remote" | "hybrid" | "onsite");
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order("saved_at", { ascending: false });

    if (error) {
      console.error("Failed to get jobs:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Failed to get jobs:", error);
    return [];
  }
}

export async function getJobById(id: string): Promise<Job | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Failed to get job:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to get job:", error);
    return null;
  }
}

export async function getJobByUrl(url: string): Promise<Job | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("url", url)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Failed to get job by URL:", error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error("Failed to get job by URL:", error);
    return null;
  }
}

export async function saveJob(job: NewJob): Promise<Job | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("jobs")
      .upsert(job, { onConflict: "url" })
      .select()
      .single();

    if (error) {
      console.error("Failed to save job:", error);
      return null;
    }

    revalidatePath("/jobs");
    return data;
  } catch (error) {
    console.error("Failed to save job:", error);
    return null;
  }
}

export async function saveJobsBatch(jobList: NewJob[]): Promise<number> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("jobs")
      .upsert(jobList, { onConflict: "url" })
      .select();

    if (error) {
      console.error("Failed to save jobs batch:", error);
      return 0;
    }

    revalidatePath("/jobs");
    return data?.length || 0;
  } catch (error) {
    console.error("Failed to save jobs batch:", error);
    return 0;
  }
}

export async function deleteJob(id: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("jobs").delete().eq("id", id);

    if (error) {
      console.error("Failed to delete job:", error);
      return false;
    }

    revalidatePath("/jobs");
    return true;
  } catch (error) {
    console.error("Failed to delete job:", error);
    return false;
  }
}

export async function updateJobMatchScore(id: string, score: number): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("jobs")
      .update({ match_score: score })
      .eq("id", id);

    if (error) {
      console.error("Failed to update match score:", error);
      return false;
    }

    revalidatePath("/jobs");
    return true;
  } catch (error) {
    console.error("Failed to update match score:", error);
    return false;
  }
}

export async function getJobsCount(): Promise<number> {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Failed to get jobs count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Failed to get jobs count:", error);
    return 0;
  }
}
