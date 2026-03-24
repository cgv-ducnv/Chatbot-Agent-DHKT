"use client";

import { DocumentDataTable } from "@/features/documents/components/document-data-table";
import { DocumentKabanBoard } from "@/features/documents/components/document-kaban-board";
import { DocumentPipelineBanner } from "@/features/documents/components/document-pipeline-banner";
import { DocumentStateCards } from "@/features/documents/components/document-state-cards";
import { normalizeDocumentsPaginated } from "@/features/documents/utils/normalize-paginated";
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
import { useMemo } from "react";
import { AppBreadcrumb } from "@/components/breadcrumb";
import { Home, ArrowUpAZ, ArrowDownAZ, Clock } from "lucide-react";
import { IconFileStack } from "@tabler/icons-react";
import {
  NavigationRailFilter,
  type FilterOption,
} from "@/components/navigation-rail-filter";
import { ProtectedRoute } from "@/components/protected-route";
import { PERMISSIONS } from "@/constants/permission";

const STATUS_OPTIONS: FilterOption[] = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ xử lý" },
  { value: "processing", label: "Đang xử lý" },
  { value: "preprocessed", label: "Tiền xử lý" },
  { value: "processed", label: "Đã xử lý" },
  { value: "failed", label: "Lỗi" },
];

const SORT_PRESET_MAP = {
  created_at_desc: { sort_by: "created_at", sort_order: "desc" as const },
  created_at_asc: { sort_by: "created_at", sort_order: "asc" as const },
  status_desc: { sort_by: "status", sort_order: "desc" as const },
  status_asc: { sort_by: "status", sort_order: "asc" as const },
} as const;

const sortOptions: FilterOption[] = [
  {
    value: "created_at_desc",
    label: "Mới nhất",
    icon: <Clock className="size-4" />,
  },
  {
    value: "created_at_asc",
    label: "Cũ nhất",
    icon: <Clock className="size-4" />,
  },
  {
    value: "status_asc",
    label: "Trạng thái A→Z",
    icon: <ArrowUpAZ className="size-4" />,
  },
  {
    value: "status_desc",
    label: "Trạng thái Z→A",
    icon: <ArrowDownAZ className="size-4" />,
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
  return "pending"; // default fallback
}

function presetFromSort(
  sortBy: string | null | undefined,
  sortOrder: string | null | undefined,
): keyof typeof SORT_PRESET_MAP | undefined {
  if (!sortBy || !sortOrder) return "created_at_desc";
  const key = `${sortBy}_${sortOrder}` as keyof typeof SORT_PRESET_MAP;
  if (key in SORT_PRESET_MAP) return key;
  return undefined;
}

function DocumentsPageContent() {
  const [query, setQuery] = useQueryParams({
    page: withDefault(NumberParam, 1),
    page_size: withDefault(NumberParam, 10),
    sort_by: withDefault(StringParam, "created_at"),
    sort_order: withDefault(StringParam, "desc"),
    mode: withDefault(StringParam, "list"),
    status_filter: withDefault(StringParam, "all"),
  });

  const viewMode: "list" | "kanban" =
    query.mode === "kanban" ? "kanban" : "list";
  const isKanbanMode = viewMode === "kanban";

  const statusFilterChoice = parseStatusChoice(query.status_filter);
  const statusFilterForApi =
    statusFilterChoice === "all" || isKanbanMode
      ? undefined
      : statusFilterChoice;
  const sortDirection: "asc" | "desc" =
    query.sort_order === "asc" ? "asc" : "desc";
  const sortField = query.sort_by?.trim() || "created_at";

  const paginatedParams = useMemo(
    (): DocumentPaginatedParams => ({
      page: query.page,
      page_size: query.page_size,
      sort_direction: sortDirection,
      sort_field: sortField,
      // Kanban: không ép status_filter, để hiển thị đủ các board.
      status_filter: statusFilterForApi,
    }),
    [query.page, query.page_size, sortDirection, sortField, statusFilterForApi],
  );

  const { data, isLoading } = useDocumentPaginated(paginatedParams);

  const { items: documents, pagination } = useMemo(
    () => normalizeDocumentsPaginated(data),
    [data],
  );

  const sortPresetKey = presetFromSort(query.sort_by, query.sort_order);

  const handleSortChange = (value: string) => {
    const preset =
      SORT_PRESET_MAP[value as keyof typeof SORT_PRESET_MAP] ??
      SORT_PRESET_MAP.created_at_desc;
    setQuery({
      sort_by: preset.sort_by,
      sort_order: preset.sort_order,
      page: 1,
    });
  };

  const handleStatusFilterChange = (value: string) => {
    setQuery({ status_filter: value, page: 1 });
  };

  const handleClearFilters = () => {
    setQuery({
      page: 1,
      page_size: 10,
      sort_by: "created_at",
      sort_order: "desc",
      status_filter: "pending",
    });
  };

  return (
    <div className="flex h-full bg-background">
      <NavigationRailFilter
        selectLabel="Sắp xếp"
        selectOptions={sortOptions}
        selectValue={sortPresetKey}
        onSelectChange={handleSortChange}
        select2Label="Lọc trạng thái"
        select2Placeholder="Chọn trạng thái"
        select2Options={STATUS_OPTIONS}
        select2Value={statusFilterChoice}
        onSelect2Change={handleStatusFilterChange}
        onClearAll={handleClearFilters}
        onApplyFilters={() => {}}
        viewMode={viewMode}
        onViewModeChange={(mode) => setQuery({ mode, page: 1 })}
        kanbanPage={query.page}
        kanbanPageSize={query.page_size}
        kanbanTotalPages={pagination?.total_pages ?? 1}
        kanbanTotal={pagination?.total ?? documents.length}
        onKanbanPageChange={(page) => setQuery({ page })}
        onKanbanPageSizeChange={(page_size) => setQuery({ page_size, page: 1 })}
      />

      <div className="flex-1 space-y-8 text-foreground animate-in fade-in duration-500 overflow-auto">
        <div className="@container/main px-4 py-4 lg:px-6 space-y-6">
          <AppBreadcrumb
            items={[
              {
                label: "Dashboard",
                href: "/dashboard",
                icon: <Home className="size-4" />,
              },
              {
                label: "Quản lý tài liệu",
                href: "/documents",
                icon: <IconFileStack className="size-4" />,
              },
            ]}
          />

          <div className="space-y-4">
            <DocumentPipelineBanner />
            <DocumentStateCards />
          </div>

          {isKanbanMode ? (
            <DocumentKabanBoard documents={documents} isLoading={isLoading} />
          ) : (
            <DocumentDataTable
              documents={documents}
              pagination={pagination}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <ProtectedRoute requiredPermissions={[PERMISSIONS.VIEW_DOCUMENTS]}>
      <DocumentsPageContent />
    </ProtectedRoute>
  );
}
