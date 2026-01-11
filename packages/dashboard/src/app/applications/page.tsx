import { getApplications } from "@/lib/actions/applications";
import { ApplicationsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const applications = await getApplications();

  // Transform data for the client component
  const formattedApplications = applications.map((app) => ({
    id: app.id,
    company: app.company || "Unknown",
    position: app.position || "Unknown",
    platform: app.platform || "unknown",
    status: app.status,
    appliedAt: app.appliedAt || new Date(),
    url: app.url || undefined,
  }));

  return <ApplicationsClient initialApplications={formattedApplications} />;
}
