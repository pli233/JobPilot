"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ExternalLink,
  Trash2,
  Send,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Zap,
} from "lucide-react";
import type { Job } from "@/lib/supabase/types";
import { formatDistanceToNow } from "date-fns";

interface JobTableProps {
  jobs: Job[];
  onApply?: (jobId: string) => void;
  onRemove?: (jobId: string) => void;
  onSelectJobs?: (jobIds: string[]) => void;
}

type SortField = "title" | "company" | "location" | "platform" | "saved_at" | "match_score" | "salary";
type SortOrder = "asc" | "desc";

export function JobTable({ jobs, onApply, onRemove, onSelectJobs }: JobTableProps) {
  const [sortField, setSortField] = useState<SortField>("saved_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedJobs = [...jobs].sort((a, b) => {
    let aVal: string | number | Date | null = null;
    let bVal: string | number | Date | null = null;

    switch (sortField) {
      case "title":
        aVal = a.title.toLowerCase();
        bVal = b.title.toLowerCase();
        break;
      case "company":
        aVal = a.company.toLowerCase();
        bVal = b.company.toLowerCase();
        break;
      case "location":
        aVal = (a.location || "").toLowerCase();
        bVal = (b.location || "").toLowerCase();
        break;
      case "platform":
        aVal = a.platform;
        bVal = b.platform;
        break;
      case "saved_at":
        aVal = new Date(a.saved_at).getTime();
        bVal = new Date(b.saved_at).getTime();
        break;
      case "match_score":
        aVal = a.match_score || 0;
        bVal = b.match_score || 0;
        break;
      case "salary":
        aVal = a.salary_max || a.salary_min || 0;
        bVal = b.salary_max || b.salary_min || 0;
        break;
    }

    if (aVal === null || bVal === null) return 0;
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    onSelectJobs?.(Array.from(newSelected));
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === jobs.length) {
      setSelectedIds(new Set());
      onSelectJobs?.([]);
    } else {
      const allIds = new Set(jobs.map((j) => j.id));
      setSelectedIds(allIds);
      onSelectJobs?.(Array.from(allIds));
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    );
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "linkedin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "indeed":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "glassdoor":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getLocationTypeColor = (type: string | null) => {
    switch (type) {
      case "remote":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300";
      case "hybrid":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      case "onsite":
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return "-";
    const formatNum = (n: number) => {
      if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
      return `$${n}`;
    };
    if (min && max) return `${formatNum(min)} - ${formatNum(max)}`;
    if (min) return `${formatNum(min)}+`;
    if (max) return `Up to ${formatNum(max)}`;
    return "-";
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[40px]">
              <Checkbox
                checked={selectedIds.size === jobs.length && jobs.length > 0}
                onCheckedChange={toggleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/80"
              onClick={() => handleSort("title")}
            >
              <div className="flex items-center">
                Title
                <SortIcon field="title" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/80"
              onClick={() => handleSort("company")}
            >
              <div className="flex items-center">
                Company
                <SortIcon field="company" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/80"
              onClick={() => handleSort("location")}
            >
              <div className="flex items-center">
                Location
                <SortIcon field="location" />
              </div>
            </TableHead>
            <TableHead>Type</TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/80"
              onClick={() => handleSort("platform")}
            >
              <div className="flex items-center">
                Platform
                <SortIcon field="platform" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/80"
              onClick={() => handleSort("salary")}
            >
              <div className="flex items-center">
                Salary
                <SortIcon field="salary" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/80"
              onClick={() => handleSort("saved_at")}
            >
              <div className="flex items-center">
                Saved
                <SortIcon field="saved_at" />
              </div>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedJobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                No jobs found
              </TableCell>
            </TableRow>
          ) : (
            sortedJobs.map((job) => (
              <TableRow
                key={job.id}
                className={selectedIds.has(job.id) ? "bg-muted/50" : ""}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(job.id)}
                    onCheckedChange={() => toggleSelect(job.id)}
                    aria-label={`Select ${job.title}`}
                  />
                </TableCell>
                <TableCell className="font-medium max-w-[250px]">
                  <div className="flex items-center gap-2">
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline truncate"
                      title={job.title}
                    >
                      {job.title}
                    </a>
                    {job.easy_apply && (
                      <span title="Easy Apply">
                        <Zap className="h-3 w-3 text-amber-500 shrink-0" />
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="max-w-[150px] truncate" title={job.company}>
                  {job.company}
                </TableCell>
                <TableCell className="max-w-[150px] truncate" title={job.location || ""}>
                  {job.location || "-"}
                </TableCell>
                <TableCell>
                  {job.location_type && (
                    <Badge variant="outline" className={getLocationTypeColor(job.location_type)}>
                      {job.location_type}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getPlatformColor(job.platform)}>
                    {job.platform}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {formatSalary(job.salary_min, job.salary_max)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {job.saved_at
                    ? formatDistanceToNow(new Date(job.saved_at), { addSuffix: true })
                    : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onApply?.(job.id)}
                      title="Apply"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      asChild
                    >
                      <a href={job.url} target="_blank" rel="noopener noreferrer" title="Open">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    {onRemove && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onRemove(job.id)}
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
