"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  DollarSign,
  Zap,
  Building2,
  Bookmark,
  ExternalLink,
} from "lucide-react";
import { MatchScoreBadge } from "./match-score-badge";
import type { Job } from "@/lib/db/schema";

interface JobCardProps {
  job: Job;
  onApply?: (jobId: string) => void;
  onSave?: (jobId: string) => void;
}

export function JobCard({ job, onApply, onSave }: JobCardProps) {
  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return null;
    if (job.salaryMin && job.salaryMax) {
      return `$${(job.salaryMin / 1000).toFixed(0)}k - $${(job.salaryMax / 1000).toFixed(0)}k`;
    }
    if (job.salaryMin) return `$${(job.salaryMin / 1000).toFixed(0)}k+`;
    return `Up to $${(job.salaryMax! / 1000).toFixed(0)}k`;
  };

  const salary = formatSalary();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg leading-tight">{job.title}</CardTitle>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{job.company}</span>
            </div>
          </div>
          <MatchScoreBadge score={job.matchScore} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {job.location && (
            <Badge variant="outline">
              <MapPin className="h-3 w-3 mr-1" />
              {job.location}
            </Badge>
          )}
          {job.locationType && (
            <Badge
              variant="outline"
              className={
                job.locationType === "remote"
                  ? "border-green-500 text-green-700"
                  : ""
              }
            >
              {job.locationType}
            </Badge>
          )}
          {salary && (
            <Badge variant="outline">
              <DollarSign className="h-3 w-3 mr-1" />
              {salary}
            </Badge>
          )}
          {job.easyApply && (
            <Badge className="bg-green-500 hover:bg-green-600">
              <Zap className="h-3 w-3 mr-1" />
              Easy Apply
            </Badge>
          )}
          <Badge variant="secondary">{job.platform}</Badge>
        </div>
        <div className="flex gap-2">
          {onApply && (
            <Button onClick={() => onApply(job.id)} className="flex-1">
              Apply
            </Button>
          )}
          <Button variant="outline" asChild>
            <a href={job.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          {onSave && (
            <Button variant="outline" onClick={() => onSave(job.id)}>
              <Bookmark className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
