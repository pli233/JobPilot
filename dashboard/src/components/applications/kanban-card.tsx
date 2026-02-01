"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Building2,
  Calendar,
  ExternalLink,
  MapPin,
  DollarSign,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface ApplicationCardData {
  id: string;
  company: string;
  position: string;
  platform: string;
  status: string;
  appliedAt: Date;
  url?: string;
  location?: string;
  locationType?: string;
  salaryMin?: number;
  salaryMax?: number;
  resumeName?: string;
  screenshotPath?: string;
  confirmationScreenshotPath?: string;
  notes?: string;
  demographicsSubmitted?: boolean;
}

interface KanbanCardProps {
  application: ApplicationCardData;
  onClick?: () => void;
  isDragging?: boolean;
}

const platformColors: Record<string, string> = {
  greenhouse: "bg-green-100 text-green-800 border-green-200",
  lever: "bg-blue-100 text-blue-800 border-blue-200",
  workday: "bg-orange-100 text-orange-800 border-orange-200",
  linkedin: "bg-sky-100 text-sky-800 border-sky-200",
  indeed: "bg-purple-100 text-purple-800 border-purple-200",
  glassdoor: "bg-teal-100 text-teal-800 border-teal-200",
};

export function KanbanCard({ application, onClick, isDragging }: KanbanCardProps) {
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
      notation: "compact",
    });
    if (min && max) {
      return `${formatter.format(min)}-${formatter.format(max)}`;
    }
    if (min) return `${formatter.format(min)}+`;
    return null;
  };

  const salaryDisplay = formatSalary(
    application.salaryMin,
    application.salaryMax
  );

  const hasScreenshots =
    application.screenshotPath || application.confirmationScreenshotPath;

  const platformColorClass =
    platformColors[application.platform] || "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <Card
      className={cn(
        "cursor-grab active:cursor-grabbing hover:shadow-md transition-all group",
        isDragging && "shadow-xl ring-2 ring-primary"
      )}
      onClick={(e) => {
        // Don't trigger click when clicking external link
        if ((e.target as HTMLElement).closest("a")) return;
        onClick?.();
      }}
    >
      <CardContent className="p-3 space-y-2">
        {/* Position Title */}
        <div className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {application.position}
        </div>

        {/* Company */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Building2 className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{application.company}</span>
        </div>

        {/* Location (if available) */}
        {application.location && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{application.location}</span>
            {application.locationType && (
              <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                {application.locationType}
              </Badge>
            )}
          </div>
        )}

        {/* Salary (if available) */}
        {salaryDisplay && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <DollarSign className="h-3 w-3 flex-shrink-0" />
            <span>{salaryDisplay}</span>
          </div>
        )}

        {/* Date and Platform Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              {formatDistanceToNow(application.appliedAt, { addSuffix: true })}
            </span>
          </div>
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 ${platformColorClass}`}
          >
            {application.platform}
          </Badge>
        </div>

        {/* Footer: Resume, Screenshots, Link */}
        <div className="flex items-center justify-between pt-1 border-t border-dashed">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {application.resumeName && (
              <div className="flex items-center gap-1" title={application.resumeName}>
                <FileText className="h-3 w-3" />
                <span className="truncate max-w-[80px]">
                  {application.resumeName.replace(/\.pdf$/i, "")}
                </span>
              </div>
            )}
            {hasScreenshots && (
              <div className="flex items-center gap-0.5" title="Has screenshots">
                <ImageIcon className="h-3 w-3" />
                <span className="text-[10px]">
                  {[
                    application.screenshotPath ? 1 : 0,
                    application.confirmationScreenshotPath ? 1 : 0,
                  ].reduce((a, b) => a + b, 0)}
                </span>
              </div>
            )}
          </div>
          {application.url && (
            <a
              href={application.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground p-1 -m-1"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
