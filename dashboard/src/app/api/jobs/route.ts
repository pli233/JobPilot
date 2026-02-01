import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("saved_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch jobs:", error);
      return NextResponse.json(
        { error: "Failed to fetch jobs" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const newJob = {
      platform: body.platform,
      title: body.title,
      company: body.company,
      location: body.location || null,
      location_type: body.locationType || body.location_type || null,
      salary_min: body.salaryMin || body.salary_min || null,
      salary_max: body.salaryMax || body.salary_max || null,
      url: body.url,
      description: body.description || null,
      easy_apply: body.easyApply || body.easy_apply || false,
      match_score: body.matchScore || body.match_score || null,
    };

    const { data, error } = await supabase
      .from("jobs")
      .upsert(newJob, { onConflict: "url" })
      .select()
      .single();

    if (error) {
      console.error("Failed to save job:", error);
      return NextResponse.json({ error: "Failed to save job" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Failed to save job:", error);
    return NextResponse.json({ error: "Failed to save job" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Job ID required" }, { status: 400 });
    }

    const { error } = await supabase.from("jobs").delete().eq("id", id);

    if (error) {
      console.error("Failed to delete job:", error);
      return NextResponse.json(
        { error: "Failed to delete job" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete job:", error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}
