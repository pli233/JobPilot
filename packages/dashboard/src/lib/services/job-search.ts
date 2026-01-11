// Unified Job Search Service
import { searchJobs as firecrawlSearch, extractJobDetails } from "./firecrawl";
import { nanoid } from "nanoid";

export interface SearchResult {
  id: string;
  platform: "linkedin" | "indeed" | "glassdoor";
  title: string;
  company: string;
  location: string | null;
  locationType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  url: string;
  description: string | null;
  easyApply: boolean;
  matchScore: number | null;
}

function detectPlatform(url: string): "linkedin" | "indeed" | "glassdoor" {
  if (url.includes("linkedin.com")) return "linkedin";
  if (url.includes("glassdoor.com")) return "glassdoor";
  return "indeed";
}

function parseTitle(text: string): { title: string; company: string } {
  // Try to extract title and company from search result
  const parts = text.split(" at ");
  if (parts.length >= 2) {
    return { title: parts[0].trim(), company: parts[1].trim() };
  }
  const parts2 = text.split(" - ");
  if (parts2.length >= 2) {
    return { title: parts2[0].trim(), company: parts2[1].trim() };
  }
  return { title: text, company: "Unknown" };
}

function parseSalary(salaryStr: string | undefined): { min: number | null; max: number | null } {
  if (!salaryStr) return { min: null, max: null };

  const numbers = salaryStr.match(/\d+[,\d]*/g);
  if (!numbers) return { min: null, max: null };

  const values = numbers.map((n) => parseInt(n.replace(/,/g, "")));

  // Convert to annual if hourly
  const isHourly = salaryStr.toLowerCase().includes("hour") || salaryStr.toLowerCase().includes("/hr");
  const multiplier = isHourly ? 2080 : 1; // 40hrs * 52 weeks

  if (values.length >= 2) {
    return {
      min: values[0] * multiplier,
      max: values[1] * multiplier,
    };
  }
  if (values.length === 1) {
    return { min: values[0] * multiplier, max: null };
  }
  return { min: null, max: null };
}

function detectLocationType(text: string): string | null {
  const lower = text.toLowerCase();
  if (lower.includes("remote")) return "remote";
  if (lower.includes("hybrid")) return "hybrid";
  if (lower.includes("on-site") || lower.includes("onsite") || lower.includes("in-office")) return "onsite";
  return null;
}

export async function searchAllPlatforms(
  query: string,
  options: {
    platforms?: ("indeed" | "glassdoor" | "linkedin")[];
    limit?: number;
  } = {}
): Promise<SearchResult[]> {
  const { platforms = ["indeed", "glassdoor"], limit = 20 } = options;
  const results: SearchResult[] = [];

  // Build platform-specific query
  const siteFilters = platforms
    .map((p) => {
      if (p === "indeed") return "site:indeed.com";
      if (p === "glassdoor") return "site:glassdoor.com";
      if (p === "linkedin") return "site:linkedin.com/jobs";
      return "";
    })
    .filter(Boolean)
    .join(" OR ");

  const fullQuery = `${query} (${siteFilters})`;

  // Search via Firecrawl
  const searchResults = await firecrawlSearch(fullQuery, limit);

  // Parse results
  for (const result of searchResults) {
    const { title, company } = parseTitle(result.title || "");
    const platform = detectPlatform(result.url);
    const locationType = detectLocationType(result.description || result.title || "");

    results.push({
      id: nanoid(),
      platform,
      title,
      company,
      location: null, // Will be enriched later
      locationType,
      salaryMin: null,
      salaryMax: null,
      url: result.url,
      description: result.description || null,
      easyApply: result.url.includes("easily apply") || result.title?.toLowerCase().includes("easy apply") || false,
      matchScore: null,
    });
  }

  // Try to extract more details for top results
  if (results.length > 0) {
    const topUrls = results.slice(0, 5).map((r) => r.url);
    try {
      const details = await extractJobDetails(topUrls);

      for (let i = 0; i < Math.min(details.length, 5); i++) {
        const detail = details[i];
        if (detail) {
          if (detail.title) results[i].title = detail.title;
          if (detail.company) results[i].company = detail.company;
          if (detail.location) results[i].location = detail.location;
          if (detail.locationType) results[i].locationType = detail.locationType;
          if (detail.salary) {
            const { min, max } = parseSalary(detail.salary);
            results[i].salaryMin = min;
            results[i].salaryMax = max;
          }
          if (detail.description) results[i].description = detail.description;
        }
      }
    } catch (error) {
      console.error("Failed to extract job details:", error);
    }
  }

  return results;
}
