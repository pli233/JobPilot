"use client";

import { JobCard } from "./job-card";
import type { Job } from "@/lib/supabase/types";

interface JobListProps {
  jobs: Job[];
  onApply?: (jobId: string) => void;
  onSave?: (jobId: string) => void;
}

export function JobList({ jobs, onApply, onSave }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-muted-foreground">
          <p className="text-lg font-medium">No jobs found</p>
          <p className="text-sm">Try adjusting your search criteria</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} onApply={onApply} onSave={onSave} />
      ))}
    </div>
  );
}
