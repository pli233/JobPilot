"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
} from "@tanstack/react-table";
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
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ExternalLink,
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Trash2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SlidersHorizontal,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ApplicationCardData } from "./kanban-card";

interface ApplicationTableProps {
  applications: ApplicationCardData[];
  onStatusChange?: (applicationId: string, newStatus: string) => void;
  onRowClick?: (application: ApplicationCardData) => void;
  onDelete?: (applicationId: string) => void;
  onBulkDelete?: (applicationIds: string[]) => void;
}

const statusOptions = ["unapplied", "applied", "oa", "interview", "offer", "rejected"];

const statusColors: Record<string, string> = {
  unapplied: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  applied: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  oa: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  interview: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  offer: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const platformColors: Record<string, string> = {
  greenhouse: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  lever: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  workday: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  linkedin: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300",
  ashby: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

export function ApplicationTable({
  applications,
  onStatusChange,
  onRowClick,
  onDelete,
  onBulkDelete,
}: ApplicationTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "appliedAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns: ColumnDef<ApplicationCardData>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            onClick={(e) => e.stopPropagation()}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "position",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-4"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Position
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="max-w-[200px] truncate font-medium" title={row.getValue("position")}>
            {row.getValue("position")}
          </div>
        ),
      },
      {
        accessorKey: "company",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-4"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Company
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="max-w-[120px] truncate" title={row.getValue("company")}>
            {row.getValue("company")}
          </div>
        ),
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => {
          const location = row.getValue("location") as string | undefined;
          const locationType = row.original.locationType;
          return (
            <div className="flex items-center gap-1 max-w-[120px]">
              <span className="truncate" title={location || ""}>
                {location || "-"}
              </span>
              {locationType && (
                <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 flex-shrink-0">
                  {locationType}
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <Select
              value={status}
              onValueChange={(value) => {
                onStatusChange?.(row.original.id, value);
              }}
            >
              <SelectTrigger
                className="w-[110px] h-7 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <Badge
                  variant="outline"
                  className={`${statusColors[status] || "bg-gray-100 text-gray-800"} border-0`}
                >
                  {status}
                </Badge>
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    <Badge
                      variant="outline"
                      className={`${statusColors[option]} border-0`}
                    >
                      {option}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: "platform",
        header: "Platform",
        cell: ({ row }) => {
          const platform = row.getValue("platform") as string;
          return (
            <Badge
              variant="outline"
              className={platformColors[platform] || platformColors.other}
            >
              {platform}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: "appliedAt",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-4"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Applied
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = row.getValue("appliedAt") as Date | undefined;
          return (
            <div className="text-sm text-muted-foreground">
              {date ? formatDistanceToNow(date, { addSuffix: true }) : "-"}
            </div>
          );
        },
        sortingFn: (rowA, rowB) => {
          const dateA = rowA.getValue("appliedAt") as Date | undefined;
          const dateB = rowB.getValue("appliedAt") as Date | undefined;
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;
          return dateA.getTime() - dateB.getTime();
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const app = row.original;
          return (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {app.url && (
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <a href={app.url} target="_blank" rel="noopener noreferrer" title="Open">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  {app.url && (
                    <DropdownMenuItem
                      onClick={() => navigator.clipboard.writeText(app.url!)}
                    >
                      Copy URL
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {onDelete && (
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(app.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [onDelete, onStatusChange]
  );

  const table = useReactTable({
    data: applications,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  // Get unique platforms for filter
  const platforms = React.useMemo(() => {
    const set = new Set(applications.map((a) => a.platform));
    return Array.from(set).sort();
  }, [applications]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search all columns..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 pr-9"
          />
          {globalFilter && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2"
              onClick={() => setGlobalFilter("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Status
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {statusOptions.map((status) => {
                const filterValue = (table.getColumn("status")?.getFilterValue() as string[]) || [];
                const isSelected = filterValue.includes(status);
                return (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={isSelected}
                    onCheckedChange={(checked: boolean) => {
                      const newValue = checked
                        ? [...filterValue, status]
                        : filterValue.filter((v) => v !== status);
                      table.getColumn("status")?.setFilterValue(newValue.length ? newValue : undefined);
                    }}
                  >
                    <Badge variant="outline" className={`${statusColors[status]} border-0 mr-2`}>
                      {status}
                    </Badge>
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Platform Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Platform
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {platforms.map((platform) => {
                const filterValue = (table.getColumn("platform")?.getFilterValue() as string[]) || [];
                const isSelected = filterValue.includes(platform);
                return (
                  <DropdownMenuCheckboxItem
                    key={platform}
                    checked={isSelected}
                    onCheckedChange={(checked: boolean) => {
                      const newValue = checked
                        ? [...filterValue, platform]
                        : filterValue.filter((v) => v !== platform);
                      table.getColumn("platform")?.setFilterValue(newValue.length ? newValue : undefined);
                    }}
                  >
                    <Badge variant="outline" className={`${platformColors[platform] || platformColors.other} border-0 mr-2`}>
                      {platform}
                    </Badge>
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value: boolean) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedRows.length > 0 && onBulkDelete && (
        <div className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-2">
          <span className="text-sm text-muted-foreground">
            {selectedRows.length} application{selectedRows.length > 1 ? "s" : ""} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onBulkDelete(selectedRows.map((row) => row.original.id))}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={onRowClick ? "cursor-pointer" : ""}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No applications found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Rows per page</span>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
