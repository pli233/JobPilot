import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { NewApplication } from "@/lib/supabase/types";

/**
 * POST /api/applications/import
 *
 * Import a new application record
 *
 * Body:
 * {
 *   company: string,
 *   position: string,
 *   jobUrl: string,
 *   platform?: string,
 *   location?: string,
 *   locationType?: string,
 *   salaryMin?: number,
 *   salaryMax?: number,
 *   status?: string,
 *   notes?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.company || !body.position) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: company, position",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Insert application
    const newApplication: NewApplication = {
      company: body.company,
      position: body.position,
      application_url: body.jobUrl,
      platform: body.platform || "other",
      location: body.location,
      location_type: body.locationType,
      salary_min: body.salaryMin,
      salary_max: body.salaryMax,
      status: body.status || "applied",
      notes: body.notes,
      applied_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("applications")
      .insert(newApplication)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      applicationId: data.id,
      message: `Application to ${body.company} - ${body.position} recorded successfully`,
    });
  } catch (error) {
    console.error("Import application error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/applications/import
 *
 * Returns usage information for this API
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/applications/import",
    method: "POST",
    description: "Import an application record",
    fields: {
      required: ["company", "position"],
      optional: [
        "jobUrl",
        "platform",
        "location",
        "locationType",
        "salaryMin",
        "salaryMax",
        "status",
        "notes",
      ],
    },
    example: {
      company: "Anthropic",
      position: "Software Engineer",
      jobUrl: "https://example.com/job/123",
      platform: "linkedin",
      location: "San Francisco, CA",
      status: "applied",
    },
  });
}
