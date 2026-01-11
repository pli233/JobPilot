"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Calendar,
  MapPin,
  DollarSign,
  FileText,
  ExternalLink,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface ApplicationDetails {
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

interface ApplicationDetailDialogProps {
  application: ApplicationDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusColors: Record<string, string> = {
  unapplied: "bg-gray-500",
  applied: "bg-blue-500",
  oa: "bg-yellow-500",
  interview: "bg-purple-500",
  offer: "bg-green-500",
  rejected: "bg-red-500",
};

const platformLabels: Record<string, string> = {
  greenhouse: "Greenhouse",
  lever: "Lever",
  workday: "Workday",
  linkedin: "LinkedIn",
  indeed: "Indeed",
  glassdoor: "Glassdoor",
  other: "Other",
};

export function ApplicationDetailDialog({
  application,
  open,
  onOpenChange,
}: ApplicationDetailDialogProps) {
  const [screenshotViewerOpen, setScreenshotViewerOpen] = useState(false);
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);

  if (!application) return null;

  const screenshots: { path: string; label: string }[] = [];
  if (application.screenshotPath) {
    screenshots.push({ path: application.screenshotPath, label: "Preview" });
  }
  if (application.confirmationScreenshotPath) {
    screenshots.push({
      path: application.confirmationScreenshotPath,
      label: "Confirmation",
    });
  }

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`;
    }
    if (min) return `${formatter.format(min)}+`;
    if (max) return `Up to ${formatter.format(max)}`;
    return null;
  };

  const salaryDisplay = formatSalary(
    application.salaryMin,
    application.salaryMax
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-xl">
                  {application.position}
                </DialogTitle>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{application.company}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="flex items-center gap-1.5"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${statusColors[application.status] || "bg-gray-500"}`}
                  />
                  {application.status.charAt(0).toUpperCase() +
                    application.status.slice(1)}
                </Badge>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Platform</div>
                <div className="font-medium">
                  {platformLabels[application.platform] || application.platform}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Applied</div>
                <div className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {format(application.appliedAt, "MMM d, yyyy")}
                  <span className="text-sm text-muted-foreground">
                    ({formatDistanceToNow(application.appliedAt, { addSuffix: true })})
                  </span>
                </div>
              </div>
            </div>

            {/* Location & Salary */}
            {(application.location || salaryDisplay) && (
              <div className="grid grid-cols-2 gap-4">
                {application.location && (
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Location</div>
                    <div className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {application.location}
                      {application.locationType && (
                        <Badge variant="secondary" className="text-xs">
                          {application.locationType}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                {salaryDisplay && (
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Salary</div>
                    <div className="font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      {salaryDisplay}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Resume Used */}
            {application.resumeName && (
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Resume Used</div>
                <div className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {application.resumeName}
                </div>
              </div>
            )}

            {/* Demographics */}
            {application.demographicsSubmitted !== undefined && (
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Demographics</div>
                <Badge variant={application.demographicsSubmitted ? "default" : "secondary"}>
                  {application.demographicsSubmitted ? "Submitted" : "Not Submitted"}
                </Badge>
              </div>
            )}

            {/* Notes */}
            {application.notes && (
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Notes</div>
                <p className="text-sm bg-muted/50 rounded-md p-3">
                  {application.notes}
                </p>
              </div>
            )}

            {/* Screenshots */}
            {screenshots.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Screenshots</div>
                <div className="flex gap-3">
                  {screenshots.map((ss, idx) => (
                    <button
                      key={ss.path}
                      onClick={() => {
                        setCurrentScreenshotIndex(idx);
                        setScreenshotViewerOpen(true);
                      }}
                      className="relative group rounded-lg border overflow-hidden hover:border-primary transition-colors"
                    >
                      <div className="w-40 h-24 bg-muted flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          View {ss.label}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-background/90 px-2 py-1 text-xs">
                        {ss.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {application.url && (
                <Button variant="outline" asChild>
                  <a
                    href={application.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Job Posting
                  </a>
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Screenshot Viewer */}
      <Dialog open={screenshotViewerOpen} onOpenChange={setScreenshotViewerOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden" showCloseButton={false}>
          <div className="relative bg-black">
            {/* Close button */}
            <button
              onClick={() => setScreenshotViewerOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Navigation */}
            {screenshots.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentScreenshotIndex((prev) =>
                      prev === 0 ? screenshots.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() =>
                    setCurrentScreenshotIndex((prev) =>
                      prev === screenshots.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Image */}
            <div className="flex items-center justify-center min-h-[400px] max-h-[80vh]">
              {screenshots[currentScreenshotIndex] && (
                <img
                  src={`/api/screenshots/${encodeURIComponent(screenshots[currentScreenshotIndex].path)}`}
                  alt={screenshots[currentScreenshotIndex].label}
                  className="max-w-full max-h-[80vh] object-contain"
                />
              )}
            </div>

            {/* Label */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="text-white text-center">
                <p className="font-medium">
                  {screenshots[currentScreenshotIndex]?.label}
                </p>
                {screenshots.length > 1 && (
                  <p className="text-sm text-white/70">
                    {currentScreenshotIndex + 1} of {screenshots.length}
                  </p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
