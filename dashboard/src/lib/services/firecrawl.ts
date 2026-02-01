// Firecrawl API Service - Direct REST calls
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || "";
const FIRECRAWL_BASE_URL = "https://api.firecrawl.dev/v1";

interface FirecrawlSearchResult {
  url: string;
  title: string;
  description?: string;
  markdown?: string;
}

interface FirecrawlSearchResponse {
  success: boolean;
  data: FirecrawlSearchResult[];
}

export async function searchJobs(query: string, limit: number = 20): Promise<FirecrawlSearchResult[]> {
  console.log("[Firecrawl] Starting search with query:", query);
  console.log("[Firecrawl] API Key present:", !!FIRECRAWL_API_KEY, "Key prefix:", FIRECRAWL_API_KEY?.substring(0, 10));

  if (!FIRECRAWL_API_KEY) {
    throw new Error("FIRECRAWL_API_KEY not configured. Please set it in .env.local");
  }

  try {
    const requestBody = {
      query: `${query} site:indeed.com OR site:glassdoor.com`,
      limit,
    };
    console.log("[Firecrawl] Request body:", JSON.stringify(requestBody));

    const response = await fetch(`${FIRECRAWL_BASE_URL}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log("[Firecrawl] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Firecrawl] Error response:", errorText);
      throw new Error(`Firecrawl API error: ${response.status} - ${errorText}`);
    }

    const data: FirecrawlSearchResponse = await response.json();
    console.log("[Firecrawl] Results count:", data.data?.length || 0);
    return data.data || [];
  } catch (error) {
    console.error("[Firecrawl] Search failed:", error);
    throw error;
  }
}

export async function scrapeJobPage(url: string): Promise<string | null> {
  if (!FIRECRAWL_API_KEY) {
    return null;
  }

  try {
    const response = await fetch(`${FIRECRAWL_BASE_URL}/scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Firecrawl scrape error: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.markdown || null;
  } catch (error) {
    console.error("Firecrawl scrape failed:", error);
    return null;
  }
}

export async function extractJobDetails(urls: string[]) {
  if (!FIRECRAWL_API_KEY) {
    return [];
  }

  try {
    const response = await fetch(`${FIRECRAWL_BASE_URL}/extract`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({
        urls,
        prompt: "Extract job title, company name, location, salary range, job type (remote/hybrid/onsite), and job description",
        schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            company: { type: "string" },
            location: { type: "string" },
            salary: { type: "string" },
            locationType: { type: "string" },
            description: { type: "string" },
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Firecrawl extract error: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Firecrawl extract failed:", error);
    return [];
  }
}
