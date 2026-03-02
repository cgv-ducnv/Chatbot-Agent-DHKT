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
  type Row,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { FAQ } from "../utils/schema";
import { FAQsDataTablePagination } from "./faqs-data-table-pagination";
import { FAQsDataTableToolbar } from "./faqs-data-table-toolbar";
import {
  useQueryParam,
  NumberParam,
  StringParam,
  withDefault,
} from "use-query-params";
import { EmptyData } from "@/components/empty-data";
import { IconMoodEmpty } from "@tabler/icons-react";
import { convertDateTime } from "@/utils/convert-time";

interface FAQsDataTableProps {
  faqs: FAQ[];
  onDeleteFaq: (id: number) => void;
  onEditFaq: (faq: FAQ) => void;
  onAddFaq?: () => void; // Optional add handler
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

export function FAQsDataTableList({
  faqs,
  onDeleteFaq,
  onEditFaq,
  onAddFaq,
  pagination,
  isLoading,
  columnVisibility: externalColumnVisibility,
  onColumnVisibilityChange,
}: FAQsDataTableProps) {
  const [page, setPage] = useQueryParam(
    "faq_page",
    withDefault(NumberParam, 1),
  );
  const [pageSize, setPageSize] = useQueryParam(
    "faq_page_size",
    withDefault(NumberParam, 10),
  );
  const [search, setSearch] = useQueryParam("faq_search", StringParam);
  const [sortBy, setSortBy] = useQueryParam("faq_sort_by", StringParam);
  const [sortOrder, setSortOrder] = useQueryParam(
    "faq_sort_order",
    StringParam,
  );

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [internalColumnVisibility, setInternalColumnVisibility] =
    useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

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

  const columns: ColumnDef<FAQ>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center px-2">
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
        <div className="flex items-center justify-center px-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
    {
      accessorKey: "question",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="-ml-4 h-8 data-[state=open]:bg-accent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Câu hỏi
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
      cell: ({ row }) => {
        return (
          <div className="flex flex-col gap-1 max-w-[500px]">
            <span
              className="font-medium text-sm leading-relaxed line-clamp-3 break-words whitespace-normal"
              title={row.original.question}
            >
              {row.original.question}
            </span>
            {row.original.intent && (
              <Badge
                variant="secondary"
                className="w-fit font-mono text-[10px] px-1 py-0 h-5"
              >
                {row.original.intent}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "aliases",
      header: "Từ khóa",
      cell: ({ row }) => {
        const aliases = row.original.aliases || [];
        const limit = 4;
        const displayedAliases = aliases.slice(0, limit);
        const remaining = aliases.length - limit;

        if (aliases.length === 0)
          return <span className="text-muted-foreground">-</span>;

        return (
          <div className="flex flex-wrap gap-1 max-w-[300px] line-clamp-2">
            {displayedAliases.map((alias, index) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 font-normal text-[10px] px-1 py-0 h-5"
                title={alias}
              >
                {alias}
              </Badge>
            ))}
            {remaining > 0 && (
              <Dialog>
                <DialogTrigger asChild>
                  <Badge
                    variant="outline"
                    className="cursor-pointer bg-background hover:bg-muted font-normal text-[10px] px-1 py-0 h-5"
                  >
                    +{remaining}
                  </Badge>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Danh sách từ khóa đồng nghĩa</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-wrap gap-2 mt-2 max-h-[60vh] overflow-y-auto p-1">
                    {aliases.map((alias, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 text-sm py-1 px-3"
                      >
                        {alias}
                      </Badge>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "answer",
      header: "Câu trả lời",
      cell: ({ row }) => (
        <div className="w-full max-w-[500px]" title={row.original.answer}>
          <span className="text-sm text-muted-foreground leading-relaxed line-clamp-3 break-words whitespace-normal">
            {row.original.answer}
          </span>
        </div>
      ),
    },

    {
      accessorKey: "priority",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="-ml-4 h-8 data-[state=open]:bg-accent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Độ ưu tiên
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
        <div className="text-center w-16">
          <Badge variant="outline">{row.original.priority}</Badge>
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="-ml-4 h-8 data-[state=open]:bg-accent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Ngày tạo
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
        <div className="flex flex-col text-sm">
          <span>
            {convertDateTime(row.original.created_at || "").date || "-"}
          </span>
          <span className="text-xs text-muted-foreground">
            {convertDateTime(row.original.created_at || "").time}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      enableSorting: false,
      header: "Hành động",
      cell: ({ row }) => {
        const faq = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => onEditFaq(faq)}
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
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={() => onDeleteFaq(faq.id)}
                >
                  <Trash2 className="size-4" />
                  <span className="dark:text-white">Xóa</span>
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
    data: faqs,
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
    <div className="space-y-4 min-w-0 max-w-full overflow-hidden">
      <FAQsDataTableToolbar
        table={table}
        search={search}
        onSearchChange={(value) => setSearch(value ?? undefined)}
        onAdd={onAddFaq}
      />
      <div className="w-full min-w-0 max-w-full overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
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
                    title="Dữ liệu FAQ trống."
                    description="Hãy thử thêm mới FAQ hoặc thay đổi thông tin tìm kiếm"
                    showButton={!!onAddFaq}
                    buttonText="Thêm FAQ"
                    onButtonClick={onAddFaq || (() => {})}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <FAQsDataTablePagination
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
