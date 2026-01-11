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
    appliedAt: app.appliedAt || new Date(),
    url: app.applicationUrl || app.url || undefined,
    // Extended fields
    location: app.location || undefined,
    locationType: app.locationType || undefined,
    salaryMin: app.salaryMin || undefined,
    salaryMax: app.salaryMax || undefined,
    resumeName: app.resumeName || undefined,
    screenshotPath: app.screenshotPath || undefined,
    confirmationScreenshotPath: app.confirmationScreenshotPath || undefined,
    notes: app.notes || undefined,
    demographicsSubmitted: app.demographicsSubmitted ?? undefined,
  }));

  return <ApplicationsClient initialApplications={formattedApplications} />;
}
