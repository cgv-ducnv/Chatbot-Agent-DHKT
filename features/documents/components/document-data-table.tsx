"use client";

import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown, Copy, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { DocumentItem } from "@/services/documents/services";
import { DocumentDataTablePagination } from "./document-data-table-pagination";
import { DocumentDataTableToolbar } from "./document-data-table-toolbar";
import {
  useQueryParam,
  NumberParam,
  StringParam,
  withDefault,
} from "use-query-params";
import { EmptyData } from "@/components/empty-data";
import { IconMoodEmpty } from "@tabler/icons-react";
import { toast } from "sonner";
import type { DocumentsPaginationMeta } from "../utils/normalize-paginated";
import { useTrackDocumentStatus } from "@/hooks/documents/use-documents";
import { DocumentDetailByTrack } from "./document-detail-by-track";

interface DocumentDataTableProps {
  documents: DocumentItem[];
  pagination?: DocumentsPaginationMeta;
  isLoading?: boolean;
}

function statusBadgeClass(status: string) {
  const s = status?.toLowerCase() ?? "";
  if (s === "processed")
    return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
  if (s === "processing")
    return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
  if (s === "failed") return "bg-red-500/15 text-red-700 dark:text-red-400";
  return "bg-muted text-muted-foreground";
}

export function DocumentDataTable({
  documents,
  pagination,
  isLoading,
}: DocumentDataTableProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const {
    data: trackStatus,
    isLoading: isTrackStatusLoading,
    isFetching: isTrackStatusFetching,
  } = useTrackDocumentStatus(selectedTrackId);

  const trackStatusPayload =
    trackStatus && typeof trackStatus === "object"
      ? {
          track_id: trackStatus.track_id,
          documents: trackStatus.documents,
          total_count: trackStatus.total_count,
          status_summary: trackStatus.status_summary,
        }
      : null;

  const [page, setPage] = useQueryParam("page", withDefault(NumberParam, 1));
  const [pageSize, setPageSize] = useQueryParam(
    "page_size",
    withDefault(NumberParam, 10),
  );
  const [sortBy, setSortBy] = useQueryParam("sort_by", StringParam);
  const [sortOrder, setSortOrder] = useQueryParam("sort_order", StringParam);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  useEffect(() => {
    if (sortBy && sortOrder) {
      setSorting([{ id: sortBy, desc: sortOrder === "desc" }]);
    } else {
      setSorting([]);
    }
  }, [sortBy, sortOrder]);

  const handleSortingChange = (
    updaterOrValue: SortingState | ((old: SortingState) => SortingState),
  ) => {
    const newSorting =
      typeof updaterOrValue === "function"
        ? updaterOrValue(sorting)
        : updaterOrValue;
    setSorting(newSorting);
    if (newSorting.length > 0) {
      const sort = newSorting[0];
      setSortBy(sort.id);
      setSortOrder(sort.desc ? "desc" : "asc");
    } else {
      setSortBy(undefined);
      setSortOrder(undefined);
    }
  };

  const columns: ColumnDef<DocumentItem>[] = [
    {
      accessorKey: "track_id",
      header: "Track ID",
      cell: ({ row }) => {
        const id = row.original.track_id;
        return (
          <div className="flex items-center gap-1 max-w-[180px]">
            <span className="truncate text-xs">{id}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 shrink-0"
              onClick={() => {
                void navigator.clipboard.writeText(id);
                toast.success("Đã copy track_id");
              }}
            >
              <Copy className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 shrink-0"
              onClick={() => {
                setSelectedTrackId(id);
                setDetailOpen(true);
              }}
              aria-label="Xem chi tiết theo track_id"
            >
              <Eye className="size-3.5" />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-4 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Trạng thái
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className={statusBadgeClass(row.original.status)}
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "content_summary",
      header: "Tóm tắt",
      cell: ({ row }) => (
        <p className="max-w-md truncate text-sm text-muted-foreground">
          {row.original.content_summary || "—"}
        </p>
      ),
    },
    {
      accessorKey: "file_path",
      header: "Đường dẫn",
      cell: ({ row }) => (
        <span className="max-w-[200px] truncate text-xs block">
          {row.original.file_path || "—"}
        </span>
      ),
    },
    {
      accessorKey: "chunks_count",
      header: "Chunks",
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.chunks_count}</span>
      ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-4 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tạo lúc
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap">
          {row.original.created_at
            ? new Date(row.original.created_at).toLocaleString("vi-VN")
            : "—"}
        </span>
      ),
    },
  ];

  const table = useReactTable({
    data: documents,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
    },
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="space-y-4">
      <DocumentDataTableToolbar />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <EmptyData
                    icon={IconMoodEmpty}
                    title="Chưa có tài liệu."
                    description="Thử đổi bộ lọc trạng thái hoặc upload tài liệu."
                    showButton={false}
                    buttonText=""
                    onButtonClick={() => {}}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DocumentDetailByTrack
        open={detailOpen}
        onOpenChange={(next) => {
          setDetailOpen(next);
          if (!next) setSelectedTrackId(null);
        }}
        trackId={selectedTrackId}
        trackStatus={trackStatusPayload}
        isLoading={isTrackStatusLoading}
        isFetching={isTrackStatusFetching}
      />
      <DocumentDataTablePagination
        table={table}
        pagination={pagination}
        currentPage={page ?? 1}
        currentPageSize={pageSize ?? 10}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
