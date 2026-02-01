"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface RecentApplication {
  id: string;
  company: string;
  position: string;
  status: string;
  appliedAt: Date;
}

interface RecentApplicationsProps {
  applications: RecentApplication[];
}

const statusColors: Record<string, string> = {
  unapplied: "bg-gray-500",
  applied: "bg-blue-500",
  oa: "bg-yellow-500",
  interview: "bg-purple-500",
  offer: "bg-green-500",
  rejected: "bg-red-500",
};

export function RecentApplications({ applications }: RecentApplicationsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {applications.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No applications yet
            </p>
          ) : (
            applications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between border-b pb-3 last:border-0"
              >
                <div className="space-y-1">
                  <p className="font-medium">{app.position}</p>
                  <p className="text-sm text-muted-foreground">{app.company}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={statusColors[app.status] || "bg-gray-500"}>
                    {app.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(app.appliedAt, { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
