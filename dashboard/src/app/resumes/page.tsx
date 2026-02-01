import { getResumes } from "@/lib/actions/resumes";
import { ResumesClient } from "./client";

export const dynamic = "force-dynamic";

export default async function ResumesPage() {
  const resumes = await getResumes();
  return <ResumesClient initialResumes={resumes} />;
}
