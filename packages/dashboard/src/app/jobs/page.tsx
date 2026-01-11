import { getJobs } from "@/lib/actions/jobs";
import { JobSearchClient } from "./client";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const savedJobs = await getJobs();

  return <JobSearchClient initialJobs={savedJobs} />;
}
