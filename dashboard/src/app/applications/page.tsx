import { getApplications } from "@/lib/actions/applications";
import { ApplicationsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const applications = await getApplications();

  // Transform data for the client component with all extended fields
  const formattedApplications = applications.map((app) => ({
    id: app.id,
    company: app.company || "Unknown",
    position: app.position || "Unknown",
    platform: app.platform || "other",
    status: app.status,
    appliedAt: app.applied_at ? new Date(app.applied_at) : new Date(),
    url: app.application_url || app.job_url || undefined,
    // Extended fields
    location: app.location || undefined,
    locationType: app.location_type || undefined,
    salaryMin: app.salary_min || undefined,
    salaryMax: app.salary_max || undefined,
    notes: app.notes || undefined,
  }));

  return <ApplicationsClient initialApplications={formattedApplications} />;
}
