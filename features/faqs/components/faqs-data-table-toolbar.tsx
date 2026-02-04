"use client";

import {
  Download,
  PlusCircle,
  Search,
  Settings2,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import debounce from "lodash/debounce";
import { FAQsImportExcelDialog } from "./faqs-import-excel-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import type { Table } from "@tanstack/react-table";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  search?: string | null;
  onSearchChange?: (value: string | null | undefined) => void;
  title?: string;
  description?: string;
  onAdd?: () => void;
}

interface FilterOption {
  label: string;
  value: string;
}

interface FacetedFilterProps<TData> {
  table: Table<TData>;
  columnId: string;
  title: string;
  options: FilterOption[];
}

function FacetedFilter<TData>({
  table,
  columnId,
  title,
  options,
}: FacetedFilterProps<TData>) {
  const column = table.getColumn(columnId);
  const facets = column?.getFacetedUniqueValues();
  const selectedValues = new Set(column?.getFilterValue() as string[]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 cursor-pointer border-dashed"
        >
          <PlusCircle className="size-4" />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="cursor-pointer rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(option.value);
                      } else {
                        selectedValues.add(option.value);
                      }
                      const filterValues = Array.from(selectedValues);
                      column?.setFilterValue(
                        filterValues.length ? filterValues : undefined,
                      );
                    }}
                    className="cursor-pointer"
                  >
                    <Checkbox checked={isSelected} className="mr-2" />
                    <span>{option.label}</span>
                    {facets?.get(option.value) && (
                      <span className="ml-auto flex size-4 items-center justify-center font-mono text-xs">
                        {facets.get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="cursor-pointer justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const columnLabels: Record<string, string> = {
  question: "Câu hỏi",
  answer: "Câu trả lời",
  intent: "Ý định",
  priority: "Độ ưu tiên",
  created_at: "Ngày tạo",
  updated_at: "Ngày cập nhật",
};

export function DataTableViewOptions<TData>({
  table,
}: {
  table: Table<TData>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 cursor-pointer">
          <Settings2 className="size-4" />
          Hiển thị
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuLabel>Hiển thị cột</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide(),
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="cursor-pointer"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {columnLabels[column.id] || column.id}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function FAQsDataTableToolbar<TData>({
  table,
  search = "",
  onSearchChange,
  title = "Danh sách FAQs",
  description,
  onAdd,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  // Local state để nhập liệu không bị lag
  const [localSearch, setLocalSearch] = useState(search ?? "");

  // Đồng bộ local state khi URL params thay đổi
  useEffect(() => {
    setLocalSearch(search ?? "");
  }, [search]);

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        onSearchChange?.(value || undefined);
      }, 500),
    [onSearchChange],
  );

  // Dọn dẹp debounce khi unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <div className="space-y-4">
      {/* Title Section */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <FAQsImportExcelDialog
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="h-8 cursor-pointer"
              >
                <Upload className="size-4" />
                Imports
              </Button>
            }
          />
          {onAdd && (
            <Button size="sm" onClick={onAdd} className="h-8 gap-1">
              <PlusCircle className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Thêm FAQ
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-wrap items-center gap-2">
        {/* <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm FAQs..."
            value={localSearch}
            onChange={(event) => {
              setLocalSearch(event.target.value);
              debouncedSearch(event.target.value);
            }}
            className="h-8 w-full pl-8 sm:w-[150px] lg:w-[250px]"
          />
        </div> */}
        {/* <DataTableViewOptions table={table} /> */}
        {isFiltered && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => table.resetColumnFilters()}
              className="h-8 cursor-pointer px-3"
            >
              Reset
              <X className="ml-1 size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
