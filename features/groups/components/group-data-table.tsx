"use client";

import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { Expand, Pencil, Trash2, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Group } from "../utils/schema";
import { DataTablePagination } from "./group-data-table-pagination";
import { GroupDataTableToolbar } from "./group-data-table-toobar";
import { EmptyData } from "@/components/empty-data";
import {
  useQueryParam,
  NumberParam,
  StringParam,
  withDefault,
} from "use-query-params";
import { IconMoodEmpty } from "@tabler/icons-react";
import { GroupUserDetail } from "./group-user-detail";

interface DataTableProps {
  groups: Group[];
  onDeleteGroup: (id: number) => void;
  onEditGroup: (group: Group) => void;
  totalPages: number;
  totalRecords: number;
  isLoading?: boolean;
  departmentId?: string;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (visibility: VisibilityState) => void;
}

export function GroupDataTable({
  groups,
  onDeleteGroup,
  onEditGroup,
  totalPages,
  totalRecords,
  isLoading,
  departmentId,
  columnVisibility: externalColumnVisibility,
  onColumnVisibilityChange,
}: DataTableProps) {
  // Danh sách các query params của api
  const [page, setPage] = useQueryParam("page", withDefault(NumberParam, 1));
  const [pageSize, setPageSize] = useQueryParam(
    "page_size",
    withDefault(NumberParam, 10),
  );
  const [search, setSearch] = useQueryParam("search", StringParam);
  const [sortBy, setSortBy] = useQueryParam("sort_by", StringParam);
  const [sortOrder, setSortOrder] = useQueryParam("sort_order", StringParam);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [internalColumnVisibility, setInternalColumnVisibility] =
    useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Use external or internal column visibility
  const columnVisibility = externalColumnVisibility ?? internalColumnVisibility;
  const setColumnVisibility = (
    updater: VisibilityState | ((prev: VisibilityState) => VisibilityState),
  ) => {
    const newVisibility =
      typeof updater === "function" ? updater(columnVisibility) : updater;
    if (onColumnVisibilityChange) {
      onColumnVisibilityChange(newVisibility);
    } else {
      setInternalColumnVisibility(newVisibility);
    }
  };

  // Sorting theo group
  useEffect(() => {
    if (sortBy && sortOrder) {
      setSorting([{ id: sortBy, desc: sortOrder === "desc" }]);
    } else {
      setSorting([]);
    }
  }, [sortBy, sortOrder]);

  // Update URL params when sorting changes
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

  // Define minimal columns even if valid rendering is custom, for state management of sorting/filtering if needed
  const columns: any[] = [{ accessorKey: "name" }];

  const table = useReactTable({
    data: groups,
    columns, // Minimal columns for internal logic
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    pageCount: totalPages,
  });

  // Tạo pagination object từ props
  const pagination = {
    total: totalRecords,
    page: page,
    page_size: pageSize,
    total_pages: totalPages,
  };

  return (
    <div className="space-y-4">
      <GroupDataTableToolbar
        table={table}
        search={search}
        onSearchChange={(value) => setSearch(value ?? undefined)}
        departmentId={departmentId}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <Card
              key={index}
              className="flex flex-col justify-between p-4 h-[140px]"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-5 w-[60%]" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="flex justify-between items-center mt-4 pt-3 border-t">
                <Skeleton className="h-4 w-12" />
                <div className="flex gap-1">
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <Skeleton className="h-7 w-7 rounded-full" />
                </div>
              </div>
            </Card>
          ))
        ) : groups.length > 0 ? (
          groups.map((group) => (
            <Card
              key={group.id}
              className="group flex flex-col justify-between p-4 transition-all hover:shadow-md hover:border-primary/50 relative overflow-hidden"
            >
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3
                        className="font-semibold text-sm truncate"
                        title={group.name}
                      >
                        {group.name}
                      </h3>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className="shrink-0 h-6 px-2 gap-1.5 font-medium text-xs text-muted-foreground bg-muted/30"
                  >
                    <Users className="size-3.5" />
                    {group.member_count || 0}
                  </Badge>
                </div>

                {group.description ? (
                  <p
                    className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5em]"
                    title={group.description}
                  >
                    {group.description}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground italic opacity-50 min-h-[2.5em]">
                    Chưa có mô tả
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-1 mt-4 pt-3 border-t border-border/50">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-primary hover:bg-primary/10"
                  title="Sửa nhóm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onEditGroup) onEditGroup(group);
                  }}
                >
                  <Pencil className="size-3.5" />
                  <span className="sr-only">Sửa</span>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-primary hover:bg-primary/10"
                  title="Chi tiết thành viên"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedGroup(group);
                    setUserDetailOpen(true);
                  }}
                >
                  <Expand className="size-3.5" />
                  <span className="sr-only">Mở rộng</span>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title="Xóa nhóm"
                  onClick={() => onDeleteGroup(group.id)}
                >
                  <Trash2 className="size-3.5" />
                  <span className="sr-only">Xóa</span>
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full min-h-[300px] flex items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
            <EmptyData
              icon={IconMoodEmpty}
              title="Dữ liệu nhóm trống."
              description="Hãy thử thêm mới thông tin nhóm hoặc thay đổi thông tin tìm kiếm"
              buttonText=""
              showButton={false}
              onButtonClick={() => {}}
            />
          </div>
        )}
      </div>

      <DataTablePagination
        table={table}
        pagination={pagination}
        currentPage={page}
        currentPageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      <GroupUserDetail
        group={selectedGroup}
        open={userDetailOpen}
        onOpenChange={setUserDetailOpen}
      />
    </div>
  );
}
