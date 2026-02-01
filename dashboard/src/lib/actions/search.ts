"use server";

import { searchAllPlatforms, type SearchResult } from "@/lib/services/job-search";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface SearchOptions {
  platforms?: ("indeed" | "glassdoor" | "linkedin")[];
  limit?: number;
  autoSave?: boolean;
}

export async function searchJobs(
  query: string,
  options: SearchOptions = {}
): Promise<{ results: SearchResult[]; saved: number; error?: string }> {
  const { platforms = ["indeed", "glassdoor"], limit = 20, autoSave = true } = options;

  // Execute search
  let results: SearchResult[];
  try {
    results = await searchAllPlatforms(query, { platforms, limit });
  } catch (error) {
    console.error("Search error:", error);
    return {
      results: [],
      saved: 0,
      error: error instanceof Error ? error.message : "Search failed"
    };
  }

  // Auto-save to database if enabled
  let savedCount = 0;
  if (autoSave && results.length > 0) {
    try {
      const supabase = await createClient();

      for (const r of results) {
        const { error } = await supabase
          .from("jobs")
          .upsert({
            platform: r.platform,
            title: r.title,
            company: r.company,
            location: r.location,
            location_type: r.locationType as "remote" | "hybrid" | "onsite" | null,
            salary_min: r.salaryMin,
            salary_max: r.salaryMax,
            url: r.url,
            description: r.description,
            easy_apply: r.easyApply,
            match_score: r.matchScore,
            saved_at: new Date().toISOString(),
          }, { onConflict: "url" });

        if (!error) {
          savedCount++;
        }
      }

      revalidatePath("/jobs");
    } catch (error) {
      console.error("Failed to save search results:", error);
    }
  }

  return { results, saved: savedCount };
}

export async function quickSearch(query: string): Promise<SearchResult[]> {
  const { results } = await searchJobs(query, {
    platforms: ["indeed", "glassdoor"],
    limit: 10,
    autoSave: true,
  });
  return results;
}
