"use client";

import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { KanbanCard, type ApplicationCardData } from "./kanban-card";
import { ApplicationDetailDialog } from "./application-detail-dialog";
import { cn } from "@/lib/utils";

const columns = [
  { id: "unapplied", title: "Unapplied", color: "bg-gray-500" },
  { id: "applied", title: "Applied", color: "bg-blue-500" },
  { id: "oa", title: "OA", color: "bg-yellow-500" },
  { id: "interview", title: "Interview", color: "bg-purple-500" },
  { id: "offer", title: "Offer", color: "bg-green-500" },
  { id: "rejected", title: "Rejected", color: "bg-red-500" },
];

type ApplicationStatus = "applied" | "oa" | "interview" | "offer" | "rejected" | "withdrawn";

interface ApplicationKanbanProps {
  applications: ApplicationCardData[];
  onStatusChange?: (applicationId: string, newStatus: ApplicationStatus) => void;
}

export function ApplicationKanban({
  applications,
  onStatusChange,
}: ApplicationKanbanProps) {
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationCardData | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const handleCardClick = (application: ApplicationCardData) => {
    setSelectedApplication(application);
    setDetailDialogOpen(true);
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Status changed - call the callback
    if (destination.droppableId !== source.droppableId) {
      onStatusChange?.(draggableId, destination.droppableId as ApplicationStatus);
    }
  };

  // Group applications by status
  const applicationsByStatus = columns.reduce(
    (acc, col) => {
      acc[col.id] = applications.filter((app) => app.status === col.id);
      return acc;
    },
    {} as Record<string, ApplicationCardData[]>
  );

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
          {columns.map((col) => (
            <div
              key={col.id}
              className="flex flex-col min-w-[280px] w-[280px] bg-muted/30 rounded-lg p-3"
            >
              {/* Column Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className={cn("w-3 h-3 rounded-full", col.color)} />
                <h3 className="font-semibold text-sm">{col.title}</h3>
                <span className="ml-auto text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">
                  {applicationsByStatus[col.id]?.length || 0}
                </span>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "flex flex-col gap-2 flex-1 overflow-y-auto min-h-[100px] rounded-md p-1 transition-colors",
                      snapshot.isDraggingOver && "bg-muted/50 ring-2 ring-primary/20"
                    )}
                  >
                    {applicationsByStatus[col.id]?.map((app, index) => (
                      <Draggable key={app.id} draggableId={app.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              "transition-transform",
                              snapshot.isDragging && "rotate-2 scale-105"
                            )}
                          >
                            <KanbanCard
                              application={app}
                              onClick={() => handleCardClick(app)}
                              isDragging={snapshot.isDragging}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <ApplicationDetailDialog
        application={selectedApplication}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </>
  );
}
