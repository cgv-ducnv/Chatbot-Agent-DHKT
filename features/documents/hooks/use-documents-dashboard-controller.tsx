"use client";

import { normalizeDocumentsPaginated } from "@/features/documents/utils/normalize-paginated";
import type { NavigationRailFilterProps } from "@/components/navigation-rail-filter";
import type { FilterOption } from "@/components/navigation-rail-filter";
import {
  useDocumentPaginated,
  type DocumentPaginatedParams,
} from "@/hooks/documents/use-documents";
import {
  useQueryParams,
  NumberParam,
  StringParam,
  withDefault,
} from "use-query-params";
import { useMemo, useState, useCallback } from "react";
import { Clock } from "lucide-react";

export const DOCUMENTS_STATUS_OPTIONS: FilterOption[] = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ xử lý" },
  { value: "processing", label: "Đang xử lý" },
  { value: "preprocessed", label: "Tiền xử lý" },
  { value: "processed", label: "Đã xử lý" },
  { value: "failed", label: "Lỗi" },
];

/** Khớp body POST /documents/paginated: sort_field + sort_direction (không sort theo status — API không dùng trong ví dụ chuẩn). */
const SORT_PRESET_MAP = {
  updated_at_desc: { sort_by: "updated_at", sort_order: "desc" as const },
  updated_at_asc: { sort_by: "updated_at", sort_order: "asc" as const },
  created_at_desc: { sort_by: "created_at", sort_order: "desc" as const },
  created_at_asc: { sort_by: "created_at", sort_order: "asc" as const },
} as const;

export const DOCUMENTS_SORT_OPTIONS: FilterOption[] = [
  {
    value: "updated_at_desc",
    label: "Cập nhật mới nhất",
    icon: <Clock className="size-4" />,
  },
  {
    value: "updated_at_asc",
    label: "Cập nhật cũ nhất",
    icon: <Clock className="size-4" />,
  },
  {
    value: "created_at_desc",
    label: "Tạo mới nhất",
    icon: <Clock className="size-4" />,
  },
  {
    value: "created_at_asc",
    label: "Tạo cũ nhất",
    icon: <Clock className="size-4" />,
  },
];

const VALID_STATUS = [
  "pending",
  "processing",
  "preprocessed",
  "processed",
  "failed",
] as const;

type StatusFilterChoice = (typeof VALID_STATUS)[number] | "all";

function parseStatusChoice(s: string | null | undefined): StatusFilterChoice {
  const normalized = s?.toLowerCase();
  if (normalized === "all") return "all";
  if (normalized && (VALID_STATUS as readonly string[]).includes(normalized)) {
    return normalized as Exclude<StatusFilterChoice, "all">;
  }
  return "all";
}

export function presetFromSort(
  sortBy: string | null | undefined,
  sortOrder: string | null | undefined,
): keyof typeof SORT_PRESET_MAP {
  if (!sortBy || !sortOrder) return "updated_at_desc";
  const key = `${sortBy}_${sortOrder}` as keyof typeof SORT_PRESET_MAP;
  if (key in SORT_PRESET_MAP) return key;
  return "updated_at_desc";
}

export type DocumentsLocalQuery = {
  page: number;
  page_size: number;
  sort_by: string;
  sort_order: "asc" | "desc";
  mode: "list" | "kanban";
  status_filter: string;
};

const DEFAULT_LOCAL_QUERY: DocumentsLocalQuery = {
  page: 1,
  page_size: 50,
  sort_by: "updated_at",
  sort_order: "desc",
  mode: "list",
  status_filter: "all",
};

export function useDocumentsDashboardController({
  paramSource,
  enabled = true,
}: {
  paramSource: "url" | "local";
  enabled?: boolean;
}) {
  const [urlQuery, setUrlQuery] = useQueryParams({
    page: withDefault(NumberParam, 1),
    page_size: withDefault(NumberParam, 50),
    sort_by: withDefault(StringParam, "updated_at"),
    sort_order: withDefault(StringParam, "desc"),
    mode: withDefault(StringParam, "list"),
    status_filter: withDefault(StringParam, "all"),
  });

  const [localQuery, setLocalQuery] =
    useState<DocumentsLocalQuery>(DEFAULT_LOCAL_QUERY);

  const query = useMemo((): DocumentsLocalQuery => {
    if (paramSource === "url") {
      return {
        page: urlQuery.page,
        page_size: urlQuery.page_size,
        sort_by: urlQuery.sort_by?.trim() || "updated_at",
        sort_order: urlQuery.sort_order === "asc" ? "asc" : "desc",
        mode: urlQuery.mode === "kanban" ? "kanban" : "list",
        status_filter: urlQuery.status_filter || "all",
      };
    }
    return localQuery;
  }, [paramSource, urlQuery, localQuery]);

  const patchQuery = useCallback(
    (patch: Partial<DocumentsLocalQuery>) => {
      if (paramSource === "url") {
        setUrlQuery({
          ...urlQuery,
          ...patch,
        });
      } else {
        setLocalQuery((prev) => ({ ...prev, ...patch }));
      }
    },
    [paramSource, urlQuery, setUrlQuery],
  );

  const viewMode: "list" | "kanban" =
    query.mode === "kanban" ? "kanban" : "list";
  const isKanbanMode = viewMode === "kanban";

  const statusFilterChoice = parseStatusChoice(query.status_filter);
  const statusFilterForApi =
    statusFilterChoice === "all" || isKanbanMode
      ? undefined
      : statusFilterChoice;
  const sortField = query.sort_by?.trim() || "updated_at";
  const sortDirection = query.sort_order;

  const paginatedParams = useMemo(
    (): DocumentPaginatedParams => ({
      page: query.page,
      page_size: query.page_size,
      sort_direction: sortDirection,
      sort_field: sortField,
      status_filter: statusFilterForApi,
    }),
    [query.page, query.page_size, sortDirection, sortField, statusFilterForApi],
  );

  const { data, isLoading } = useDocumentPaginated(paginatedParams, {
    enabled,
  });

  const { items: documents, pagination } = useMemo(
    () => normalizeDocumentsPaginated(data),
    [data],
  );

  const sortPresetKey = presetFromSort(query.sort_by, query.sort_order);

  const handleSortChange = useCallback(
    (value: string) => {
      const preset =
        SORT_PRESET_MAP[value as keyof typeof SORT_PRESET_MAP] ??
        SORT_PRESET_MAP.updated_at_desc;
      patchQuery({
        sort_by: preset.sort_by,
        sort_order: preset.sort_order,
        page: 1,
      });
    },
    [patchQuery],
  );

  const handleStatusFilterChange = useCallback(
    (value: string) => {
      patchQuery({ status_filter: value, page: 1 });
    },
    [patchQuery],
  );

  const handleClearFilters = useCallback(() => {
    patchQuery({
      ...DEFAULT_LOCAL_QUERY,
      page: 1,
    });
  }, [patchQuery]);

  const railProps: NavigationRailFilterProps = useMemo(
    () => ({
      selectLabel: "Sắp xếp",
      selectOptions: DOCUMENTS_SORT_OPTIONS,
      selectValue: sortPresetKey,
      onSelectChange: handleSortChange,
      select2Label: "Lọc trạng thái",
      select2Placeholder: "Chọn trạng thái",
      select2Options: DOCUMENTS_STATUS_OPTIONS,
      select2Value: statusFilterChoice,
      onSelect2Change: handleStatusFilterChange,
      onClearAll: handleClearFilters,
      onApplyFilters: () => {},
      viewMode,
      onViewModeChange: (mode) => patchQuery({ mode, page: 1 }),
      kanbanPage: query.page,
      kanbanPageSize: query.page_size,
      kanbanTotalPages: pagination?.total_pages ?? 1,
      kanbanTotal: pagination?.total ?? documents.length,
      onKanbanPageChange: (page) => patchQuery({ page }),
      onKanbanPageSizeChange: (page_size) => patchQuery({ page_size, page: 1 }),
    }),
    [
      sortPresetKey,
      handleSortChange,
      statusFilterChoice,
      handleStatusFilterChange,
      handleClearFilters,
      viewMode,
      patchQuery,
      query.page,
      query.page_size,
      pagination?.total_pages,
      pagination?.total,
      documents.length,
    ],
  );

  return {
    railProps,
    documents,
    pagination,
    isLoading,
    isKanbanMode,
    viewMode,
    query,
    patchQuery,
  };
}

export type DocumentsDashboardController = ReturnType<
  typeof useDocumentsDashboardController
>;
