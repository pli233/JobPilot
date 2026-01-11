import { NextRequest, NextResponse } from "next/server";
import { quickAddApplication, importApplication } from "@/lib/actions/import-application";

/**
 * POST /api/applications/import
 *
 * Import a new application from Claude automation
 *
 * Body (quick mode):
 * {
 *   company: string,
 *   position: string,
 *   jobUrl: string,
 *   resumeName: string,
 *   platform?: string,
 *   location?: string,
 *   salaryRange?: string,
 *   previewScreenshot?: string,
 *   confirmationScreenshot?: string
 * }
 *
 * Body (full mode - add "fullMode": true):
 * {
 *   fullMode: true,
 *   company: string,
 *   position: string,
 *   jobUrl: string,
 *   platform: string,
 *   location?: string,
 *   locationType?: string,
 *   salaryMin?: number,
 *   salaryMax?: number,
 *   resumeName: string,
 *   appliedAt: string (ISO date),
 *   status?: string,
 *   notes?: string,
 *   previewScreenshotPath?: string,
 *   confirmationScreenshotPath?: string,
 *   demographicsSubmitted?: boolean
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.company || !body.position || !body.jobUrl || !body.resumeName) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: company, position, jobUrl, resumeName",
        },
        { status: 400 }
      );
    }

    let result;

    if (body.fullMode) {
      // Full import mode
      result = await importApplication({
        company: body.company,
        position: body.position,
        jobUrl: body.jobUrl,
        platform: body.platform || "other",
        location: body.location,
        locationType: body.locationType,
        salaryMin: body.salaryMin,
        salaryMax: body.salaryMax,
        resumeName: body.resumeName,
        appliedAt: body.appliedAt ? new Date(body.appliedAt) : new Date(),
        status: body.status,
        notes: body.notes,
        previewScreenshotPath: body.previewScreenshotPath,
        confirmationScreenshotPath: body.confirmationScreenshotPath,
        demographicsSubmitted: body.demographicsSubmitted,
      });
    } else {
      // Quick add mode
      result = await quickAddApplication({
        company: body.company,
        position: body.position,
        jobUrl: body.jobUrl,
        resumeName: body.resumeName,
        platform: body.platform,
        location: body.location,
        salaryRange: body.salaryRange,
        previewScreenshot: body.previewScreenshot,
        confirmationScreenshot: body.confirmationScreenshot,
      });
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        applicationId: result.applicationId,
        message: `Application to ${body.company} - ${body.position} recorded successfully`,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }
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
    description: "Import an application from Claude automation",
    quickModeFields: {
      required: ["company", "position", "jobUrl", "resumeName"],
      optional: [
        "platform",
        "location",
        "salaryRange",
        "previewScreenshot",
        "confirmationScreenshot",
      ],
    },
    fullModeFields: {
      required: ["fullMode: true", "company", "position", "jobUrl", "platform", "resumeName"],
      optional: [
        "location",
        "locationType",
        "salaryMin",
        "salaryMax",
        "appliedAt",
        "status",
        "notes",
        "previewScreenshotPath",
        "confirmationScreenshotPath",
        "demographicsSubmitted",
      ],
    },
    example: {
      company: "StubHub",
      position: "Software Engineer I - New Grad",
      jobUrl: "https://job-boards.eu.greenhouse.io/stubhubinc/jobs/4749965101",
      resumeName: "Peiyuan Li 26NG.pdf",
      location: "Los Angeles, CA (Hybrid)",
      salaryRange: "$120,000 - $150,000",
      previewScreenshot: "data/screenshots/stubhub-2025-01-11-preview.png",
      confirmationScreenshot: "data/screenshots/stubhub-2025-01-11-confirmation.png",
    },
  });
}
