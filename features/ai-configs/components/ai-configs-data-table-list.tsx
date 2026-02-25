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
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  EllipsisVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { AIConfig } from "../utils/schema";
import { DataTablePagination } from "./ai-configs-data-table-pagination";
import { DataTableToolbar } from "./ai-configs-data-table-toolbar";
import {
  useQueryParam,
  NumberParam,
  StringParam,
  withDefault,
} from "use-query-params";
import { EmptyData } from "@/components/empty-data";
import { IconMoodEmpty, IconComponents } from "@tabler/icons-react";
import ReactCountryFlag from "react-country-flag";
import { LANGUAGE_OPTIONS } from "@/constants/language";
import { convertDateTime } from "@/utils/convert-time";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DataTableProps {
  configs: AIConfig[];
  onDeleteConfig: (id: number) => void;
  onEditConfig: (config: AIConfig) => void;
  pagination?: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
  isLoading?: boolean;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (visibility: VisibilityState) => void;
}

export function AIConfigsDataTableList({
  configs,
  onDeleteConfig,
  onEditConfig,
  pagination,
  isLoading,
  columnVisibility: externalColumnVisibility,
  onColumnVisibilityChange,
}: DataTableProps) {
  // Sync URL query params with stable defaults
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

  // Sync sorting state with URL params
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

  const columns: ColumnDef<AIConfig>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center min-w-[40px]">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center min-w-[40px]">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="-ml-2 h-8 data-[state=open]:bg-accent hover:bg-transparent p-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tên cấu hình
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex flex-col py-1">
          <span className="font-semibold whitespace-normal text-primary">
            {row.original.name}
          </span>
          <span className="text-sm text-muted-foreground line-clamp-2 whitespace-normal mt-0.5">
            {row.original.description}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "model_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="-ml-2 h-8 data-[state=open]:bg-accent hover:bg-transparent p-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Model
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => (
        <span className="font-medium">{row.original.model_name}</span>
      ),
    },
    {
      accessorKey: "language",
      header: "Ngôn ngữ",
      cell: ({ row }) => {
        const language = LANGUAGE_OPTIONS.find(
          (l) => l.value === row.original.language,
        );
        return (
          <div className="flex items-center gap-2">
            {language?.countryCode && (
              <ReactCountryFlag
                countryCode={language.countryCode}
                svg
                style={{
                  width: "1.5em",
                  height: "1.5em",
                }}
              />
            )}
            <span>{language?.label || row.original.language}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Ngày tạo",

      cell: ({ row }) => (
        <div className="flex flex-col p-1 min-w-[100px]">
          <span>{convertDateTime(row.original.created_at).date}</span>
          <span className="text-xs text-muted-foreground">
            {convertDateTime(row.original.created_at).time}
          </span>
        </div>
      ),
    },
    // {
    //   accessorKey: "prompt",
    //   header: "Prompt",
    //   cell: ({ row }) => <span className="truncate max-w-[200px]">{row.original.prompt}</span>,
    // },
    {
      id: "actions",
      enableSorting: false,
      header: () => <div>Hành động</div>,
      cell: ({ row }) => {
        const config = row.original;
        return (
          <div className="flex items-centergap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => onEditConfig(config)}
            >
              <Pencil className="size-4" />
              <span className="sr-only">Sửa</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer"
                >
                  <EllipsisVertical className="size-4" />
                  <span className="sr-only">Hành động</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  variant="default"
                  className="cursor-pointer"
                  asChild
                >
                  <Link href={`/ai-configs/${config.id}`}>
                    <IconComponents className="size-4" />
                    Xem chi tiết
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={() => onDeleteConfig(config.id)}
                >
                  <Trash2 className="size-4" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  /* eslint-disable-next-line */
  const table = useReactTable({
    data: configs,
    columns,
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
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        search={search}
        onSearchChange={(value) => setSearch(value ?? undefined)}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        "px-4 py-3",
                        header.id === "name" && "w-[30%] max-w-[30%]",
                        header.id === "model_name" && "hidden md:table-cell",
                        header.id === "language" && "hidden sm:table-cell",
                        header.id === "created_at" && "hidden lg:table-cell",
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((column, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "px-4 py-3",
                        cell.column.id === "name" && "w-[30%] max-w-[30%]",
                        cell.column.id === "model_name" &&
                          "hidden md:table-cell",
                        cell.column.id === "language" && "hidden sm:table-cell",
                        cell.column.id === "created_at" &&
                          "hidden lg:table-cell",
                      )}
                    >
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
                    title="Dữ liệu agent trống."
                    description="Hãy thử thêm mới agent hoặc thay đổi thông tin tìm kiếm"
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
      <DataTablePagination
        table={table}
        pagination={pagination}
        currentPage={page}
        currentPageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
