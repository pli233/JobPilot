"use client";

import { useState, useTransition } from "react";
import { ApplicationKanban } from "@/components/applications/application-kanban";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { updateApplicationStatus } from "@/lib/actions/applications";
import { getExcelExportData } from "@/lib/actions/export";
import { useRouter } from "next/navigation";

interface Application {
  id: string;
  company: string;
  position: string;
  platform: string;
  status: string;
  appliedAt: Date;
  url?: string;
}

interface ApplicationsClientProps {
  initialApplications: Application[];
}

export function ApplicationsClient({ initialApplications }: ApplicationsClientProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [isPending, startTransition] = useTransition();
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();

  const handleStatusChange = (applicationId: string, newStatus: string) => {
    // Optimistic update
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      )
    );

    startTransition(async () => {
      const success = await updateApplicationStatus(applicationId, newStatus);
      if (success) {
        toast.success(`Status updated to ${newStatus}`);
      } else {
        // Revert on failure
        setApplications(initialApplications);
        toast.error("Failed to update status");
      }
    });
  };

  const handleRefresh = () => {
    router.refresh();
    toast.success("Data refreshed");
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportData = await getExcelExportData("applications");

      // Show info about using Excel MCP
      toast.info(
        <div className="space-y-2">
          <p className="font-medium">Export Ready</p>
          <p className="text-sm">
            Ask Claude to write to Excel using:
          </p>
          <code className="text-xs bg-muted p-1 rounded block">
            excel:write_data_to_excel
          </code>
          <p className="text-xs text-muted-foreground">
            File: {exportData.filepath}
          </p>
        </div>,
        { duration: 8000 }
      );
    } catch {
      toast.error("Failed to prepare export");
    } finally {
      setIsExporting(false);
    }
  };

  const statusCounts = {
    applied: applications.filter((a) => a.status === "applied").length,
    viewed: applications.filter((a) => a.status === "viewed").length,
    interview: applications.filter((a) => a.status === "interview").length,
    offer: applications.filter((a) => a.status === "offer").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground">
            Track and manage your job applications
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isPending}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Applied", count: statusCounts.applied, color: "bg-blue-500" },
          { label: "Viewed", count: statusCounts.viewed, color: "bg-yellow-500" },
          { label: "Interview", count: statusCounts.interview, color: "bg-purple-500" },
          { label: "Offer", count: statusCounts.offer, color: "bg-green-500" },
          { label: "Rejected", count: statusCounts.rejected, color: "bg-red-500" },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 rounded-lg border p-3">
            <div className={`h-3 w-3 rounded-full ${stat.color}`} />
            <div>
              <p className="text-2xl font-bold">{stat.count}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {applications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
          <Info className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No applications yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Start by searching for jobs and applying
          </p>
        </div>
      )}

      {/* Kanban Board */}
      {applications.length > 0 && (
        <ApplicationKanban
          applications={applications}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
