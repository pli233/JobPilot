"use client";

import { KanbanColumn } from "./kanban-column";

const columns = [
  { id: "applied", title: "Applied", color: "bg-blue-500" },
  { id: "viewed", title: "Viewed", color: "bg-yellow-500" },
  { id: "interview", title: "Interview", color: "bg-purple-500" },
  { id: "offer", title: "Offer", color: "bg-green-500" },
  { id: "rejected", title: "Rejected", color: "bg-red-500" },
];

interface Application {
  id: string;
  company: string;
  position: string;
  platform: string;
  status: string;
  appliedAt: Date;
  url?: string;
}

interface ApplicationKanbanProps {
  applications: Application[];
  onStatusChange?: (applicationId: string, newStatus: string) => void;
}

export function ApplicationKanban({
  applications,
  onStatusChange,
}: ApplicationKanbanProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
      {columns.map((col) => (
        <KanbanColumn
          key={col.id}
          column={col}
          applications={applications
            .filter((a) => a.status === col.id)
            .map((a) => ({
              id: a.id,
              company: a.company,
              position: a.position,
              platform: a.platform,
              appliedAt: a.appliedAt,
              url: a.url,
            }))}
          onDrop={onStatusChange}
        />
      ))}
    </div>
  );
}
