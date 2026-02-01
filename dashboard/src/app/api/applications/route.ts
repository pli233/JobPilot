import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
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
          platform
        )
      `)
      .order("applied_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch applications:", error);
      return NextResponse.json(
        { error: "Failed to fetch applications" },
        { status: 500 }
      );
    }

    // Transform to match expected format
    const transformed = (data || []).map((app: any) => ({
      id: app.id,
      jobId: app.job_id,
      resumeId: app.resume_id,
      status: app.status,
      appliedAt: app.applied_at,
      notes: app.notes,
      createdAt: app.created_at,
      company: app.company || app.jobs?.company,
      position: app.position || app.jobs?.title,
      platform: app.platform || app.jobs?.platform,
      url: app.application_url || app.jobs?.url,
      salaryMin: app.salary_min,
      salaryMax: app.salary_max,
      location: app.location,
      locationType: app.location_type,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Failed to fetch applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const newApplication = {
      job_id: body.jobId || body.job_id || null,
      resume_id: body.resumeId || body.resume_id || null,
      status: body.status || "applied",
      applied_at: body.appliedAt || body.applied_at || new Date().toISOString(),
      notes: body.notes || null,
      platform: body.platform || null,
      application_url: body.applicationUrl || body.application_url || null,
      salary_min: body.salaryMin || body.salary_min || null,
      salary_max: body.salaryMax || body.salary_max || null,
      location: body.location || null,
      location_type: body.locationType || body.location_type || null,
      company: body.company || null,
      position: body.position || null,
    };

    const { data, error } = await supabase
      .from("applications")
      .insert(newApplication)
      .select()
      .single();

    if (error) {
      console.error("Failed to create application:", error);
      return NextResponse.json(
        { error: "Failed to create application" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Failed to create application:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Application ID required" },
        { status: 400 }
      );
    }

    // Convert camelCase to snake_case for Supabase
    const snakeCaseUpdates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.status) snakeCaseUpdates.status = updates.status;
    if (updates.notes !== undefined) snakeCaseUpdates.notes = updates.notes;
    if (updates.appliedAt) snakeCaseUpdates.applied_at = updates.appliedAt;

    const { error } = await supabase
      .from("applications")
      .update(snakeCaseUpdates)
      .eq("id", id);

    if (error) {
      console.error("Failed to update application:", error);
      return NextResponse.json(
        { error: "Failed to update application" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update application:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Application ID required" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("applications").delete().eq("id", id);

    if (error) {
      console.error("Failed to delete application:", error);
      return NextResponse.json(
        { error: "Failed to delete application" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete application:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
