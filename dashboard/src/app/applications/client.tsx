"use client";

import { useState, useTransition } from "react";
import { ApplicationKanban } from "@/components/applications/application-kanban";
import { ApplicationTable } from "@/components/applications/application-table";
import { ApplicationDetailDialog } from "@/components/applications/application-detail-dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw, Info, Table as TableIcon, Kanban } from "lucide-react";
import { toast } from "sonner";
import { updateApplicationStatus, deleteApplication } from "@/lib/actions/applications";
import { useRouter } from "next/navigation";
import type { ApplicationCardData } from "@/components/applications/kanban-card";

interface ApplicationsClientProps {
  initialApplications: ApplicationCardData[];
}

export function ApplicationsClient({ initialApplications }: ApplicationsClientProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [isPending, startTransition] = useTransition();
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [selectedApplication, setSelectedApplication] = useState<ApplicationCardData | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const router = useRouter();

  // Filter applications based on selected status
  const filteredApplications = statusFilter
    ? applications.filter((app) => app.status === statusFilter)
    : applications;

  const handleStatusChange = (applicationId: string, newStatus: "applied" | "oa" | "interview" | "offer" | "rejected" | "withdrawn") => {
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

  const handleDelete = async (applicationId: string) => {
    if (!confirm("Are you sure you want to delete this application?")) {
      return;
    }

    try {
      const success = await deleteApplication(applicationId);
      if (success) {
        setApplications((prev) => prev.filter((app) => app.id !== applicationId));
        toast.success("Application deleted");
      } else {
        toast.error("Failed to delete application");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete application");
    }
  };

  const handleBulkDelete = async (applicationIds: string[]) => {
    if (!confirm(`Are you sure you want to delete ${applicationIds.length} applications?`)) {
      return;
    }

    try {
      let successCount = 0;
      for (const id of applicationIds) {
        const success = await deleteApplication(id);
        if (success) successCount++;
      }

      if (successCount > 0) {
        setApplications((prev) => prev.filter((app) => !applicationIds.includes(app.id)));
        toast.success(`Deleted ${successCount} applications`);
      }

      if (successCount < applicationIds.length) {
        toast.error(`Failed to delete ${applicationIds.length - successCount} applications`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete applications");
    }
  };

  const statusCounts = {
    applied: applications.filter((a) => a.status === "applied").length,
    oa: applications.filter((a) => a.status === "oa").length,
    interview: applications.filter((a) => a.status === "interview").length,
    offer: applications.filter((a) => a.status === "offer").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
    withdrawn: applications.filter((a) => a.status === "withdrawn").length,
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
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 rounded-lg border p-1">
            <Button
              variant={viewMode === "kanban" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-3"
              onClick={() => setViewMode("kanban")}
            >
              <Kanban className="h-4 w-4 mr-1" />
              Kanban
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-3"
              onClick={() => setViewMode("table")}
            >
              <TableIcon className="h-4 w-4 mr-1" />
              Table
            </Button>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={isPending}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Summary - Clickable Filters */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { label: "Applied", value: "applied", count: statusCounts.applied, color: "bg-blue-500" },
          { label: "OA", value: "oa", count: statusCounts.oa, color: "bg-yellow-500" },
          { label: "Interview", value: "interview", count: statusCounts.interview, color: "bg-purple-500" },
          { label: "Offer", value: "offer", count: statusCounts.offer, color: "bg-green-500" },
          { label: "Rejected", value: "rejected", count: statusCounts.rejected, color: "bg-red-500" },
          { label: "Withdrawn", value: "withdrawn", count: statusCounts.withdrawn, color: "bg-gray-500" },
        ].map((stat) => (
          <button
            key={stat.label}
            onClick={() => setStatusFilter(statusFilter === stat.value ? null : stat.value)}
            className={`flex items-center gap-3 rounded-lg border p-3 transition-all hover:shadow-md cursor-pointer text-left ${
              statusFilter === stat.value
                ? "ring-2 ring-primary border-primary bg-primary/5"
                : "hover:border-muted-foreground/50"
            }`}
          >
            <div className={`h-3 w-3 rounded-full ${stat.color}`} />
            <div>
              <p className="text-2xl font-bold">{stat.count}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </button>
        ))}
      </div>
      {/* Active Filter Indicator */}
      {statusFilter && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Filtering by: <span className="font-medium capitalize">{statusFilter}</span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2"
            onClick={() => setStatusFilter(null)}
          >
            Clear
          </Button>
        </div>
      )}

      {/* Empty State */}
      {applications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
          <Info className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No applications yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Add your job applications to track them here
          </p>
        </div>
      )}

      {/* Kanban Board or Table View */}
      {applications.length > 0 && (
        viewMode === "kanban" ? (
          <ApplicationKanban
            applications={filteredApplications}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <ApplicationTable
            applications={filteredApplications}
            onStatusChange={handleStatusChange}
            onRowClick={(app) => {
              setSelectedApplication(app);
              setDetailDialogOpen(true);
            }}
            onDelete={handleDelete}
            onBulkDelete={handleBulkDelete}
          />
        )
      )}

      {/* Application Detail Dialog */}
      {selectedApplication && (
        <ApplicationDetailDialog
          application={selectedApplication}
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
        />
      )}
    </div>
  );
}
