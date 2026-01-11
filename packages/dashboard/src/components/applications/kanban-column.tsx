"use client";

import { KanbanCard } from "./kanban-card";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  column: {
    id: string;
    title: string;
    color: string;
  };
  applications: Array<{
    id: string;
    company: string;
    position: string;
    platform: string;
    appliedAt: Date;
    url?: string;
  }>;
  onDrop?: (applicationId: string, newStatus: string) => void;
}

export function KanbanColumn({ column, applications, onDrop }: KanbanColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("bg-muted/50");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("bg-muted/50");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-muted/50");
    const applicationId = e.dataTransfer.getData("applicationId");
    if (applicationId && onDrop) {
      onDrop(applicationId, column.id);
    }
  };

  const handleDragStart = (e: React.DragEvent, applicationId: string) => {
    e.dataTransfer.setData("applicationId", applicationId);
  };

  return (
    <div
      className="flex flex-col min-w-[280px] w-[280px] bg-muted/30 rounded-lg p-3 transition-colors"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("w-3 h-3 rounded-full", column.color)} />
        <h3 className="font-semibold text-sm">{column.title}</h3>
        <span className="ml-auto text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">
          {applications.length}
        </span>
      </div>
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
        {applications.map((app) => (
          <div
            key={app.id}
            draggable
            onDragStart={(e) => handleDragStart(e, app.id)}
          >
            <KanbanCard application={app} />
          </div>
        ))}
      </div>
    </div>
  );
}
