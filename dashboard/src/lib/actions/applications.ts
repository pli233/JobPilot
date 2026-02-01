"use server";

import { createClient } from "@/lib/supabase/server";
import type { Application, NewApplication } from "@/lib/supabase/types";
import { revalidatePath } from "next/cache";

export interface ApplicationWithJob {
  id: string;
  job_id: string | null;
  resume_id: string | null;
  status: string;
  applied_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  company: string | null;
  position: string | null;
  platform: string | null;
  application_url: string | null;
  salary_min: number | null;
  salary_max: number | null;
  location: string | null;
  location_type: string | null;
  // From joined jobs table
  job_url?: string | null;
  job_company?: string | null;
  job_title?: string | null;
}

export async function getApplications(): Promise<ApplicationWithJob[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("applications")
      .select(`
        *,
        jobs (
          url,
          company,
          title,
          salary_min,
          salary_max,
          location,
          location_type
        )
      `)
      .order("applied_at", { ascending: false });

    if (error) {
      console.error("Failed to get applications:", error);
      return [];
    }

    // Transform data to include job info with fallbacks
    return (data || []).map((app: any) => ({
      ...app,
      company: app.company || app.jobs?.company || null,
      position: app.position || app.jobs?.title || null,
      salary_min: app.salary_min || app.jobs?.salary_min || null,
      salary_max: app.salary_max || app.jobs?.salary_max || null,
      location: app.location || app.jobs?.location || null,
      location_type: app.location_type || app.jobs?.location_type || null,
      job_url: app.jobs?.url || null,
    }));
  } catch (error) {
    console.error("Failed to get applications:", error);
    return [];
  }
}

export async function getApplicationById(id: string): Promise<ApplicationWithJob | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("applications")
      .select(`
        *,
        jobs (
          url,
          company,
          title,
          salary_min,
          salary_max,
          location,
          location_type
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Failed to get application:", error);
      return null;
    }

    if (!data) return null;

    const app = data as any;
    return {
      ...app,
      company: app.company || app.jobs?.company || null,
      position: app.position || app.jobs?.title || null,
      salary_min: app.salary_min || app.jobs?.salary_min || null,
      salary_max: app.salary_max || app.jobs?.salary_max || null,
      location: app.location || app.jobs?.location || null,
      location_type: app.location_type || app.jobs?.location_type || null,
      job_url: app.jobs?.url || null,
    };
  } catch (error) {
    console.error("Failed to get application:", error);
    return null;
  }
}

export async function createApplication(
  data: NewApplication
): Promise<Application | null> {
  try {
    const supabase = await createClient();

    const { data: result, error } = await supabase
      .from("applications")
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error("Failed to create application:", error);
      return null;
    }

    revalidatePath("/applications");
    revalidatePath("/");
    return result;
  } catch (error) {
    console.error("Failed to create application:", error);
    return null;
  }
}

export async function updateApplicationStatus(
  id: string,
  status: "applied" | "oa" | "interview" | "offer" | "rejected" | "withdrawn"
): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("applications")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Failed to update application status:", error);
      return false;
    }

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
    const supabase = await createClient();

    const { error } = await supabase
      .from("applications")
      .update({ notes, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Failed to update application notes:", error);
      return false;
    }

    revalidatePath("/applications");
    return true;
  } catch (error) {
    console.error("Failed to update application notes:", error);
    return false;
  }
}

export async function deleteApplication(id: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete application:", error);
      return false;
    }

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
    const supabase = await createClient();

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Get all applications
    const { data: allApps, error } = await supabase
      .from("applications")
      .select("*");

    if (error) {
      console.error("Failed to get application stats:", error);
      return {
        weekly: 0,
        total: 0,
        interviewRate: 0,
        responseRate: 0,
        weeklyChange: 0,
      };
    }

    const apps = allApps || [];

    // Calculate stats
    const total = apps.length;
    const weekly = apps.filter(
      (a) => a.applied_at && new Date(a.applied_at) >= weekAgo
    ).length;
    const lastWeekly = apps.filter(
      (a) =>
        a.applied_at &&
        new Date(a.applied_at) >= twoWeeksAgo &&
        new Date(a.applied_at) < weekAgo
    ).length;

    const interviews = apps.filter((a) => a.status === "interview").length;
    const responded = apps.filter(
      (a) => a.status !== "applied"
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
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("applications")
      .select(`
        id,
        status,
        applied_at,
        company,
        position,
        jobs (
          company,
          title
        )
      `)
      .order("applied_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Failed to get recent applications:", error);
      return [];
    }

    return (data || []).map((r: any) => ({
      id: r.id,
      company: r.company || r.jobs?.company || "Unknown",
      position: r.position || r.jobs?.title || "Unknown",
      status: r.status,
      appliedAt: r.applied_at || new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Failed to get recent applications:", error);
    return [];
  }
}
