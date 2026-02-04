"use client";

import { useAIConfigs, useDeleteAIConfig } from "@/hooks/ai-configs/services";
import { AIConfigsDataTableList } from "@/features/ai-configs/components/ai-configs-data-table-list";
import { AIConfigFormDialog } from "@/features/ai-configs/components/ai-configs-form-modal";
import { useState, useEffect } from "react";
import type { AIConfig } from "@/features/ai-configs/utils/schema";
import {
  useQueryParams,
  NumberParam,
  StringParam,
  withDefault,
} from "use-query-params";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { AppBreadcrumb } from "@/components/breadcrumb";
import { Home, ArrowUpAZ, ArrowDownAZ, Clock, Bot } from "lucide-react";
import {
  NavigationRailFilter,
  type FilterOption,
  type ColumnOption,
} from "@/components/navigation-rail-filter";
import { ProtectedRoute } from "@/components/protected-route";
import { PERMISSIONS } from "@/constants/permission";
import { IconRobot } from "@tabler/icons-react";

// Sort options
const sortOptions: FilterOption[] = [
  {
    value: "name_asc",
    label: "Tên A-Z",
    icon: <ArrowUpAZ className="size-4" />,
  },
  {
    value: "name_desc",
    label: "Tên Z-A",
    icon: <ArrowDownAZ className="size-4" />,
  },
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
];

// Column options for visibility toggle
const columnOptions: ColumnOption[] = [
  { id: "name", label: "Tên cấu hình" },
  { id: "model_name", label: "Model" },
  { id: "language", label: "Ngôn ngữ" },
];

function AIConfigsPageContent() {
  // State for edit dialog
  const [editingConfig, setEditingConfig] = useState<AIConfig | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // State for delete dialog
  const [deletingConfig, setDeletingConfig] = useState<AIConfig | null>(null);

  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});

  // Sync query params with URL
  const [query, setQuery] = useQueryParams({
    page: withDefault(NumberParam, 1),
    page_size: withDefault(NumberParam, 10),
    search: StringParam,
    sort_by: StringParam,
  });

  // Set default query params in URL on mount
  useEffect(() => {
    if (query.page === 1 && query.page_size === 10) {
      setQuery({ page: 1, page_size: 10 }, "replaceIn");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch data
  const { data, isLoading, error } = useAIConfigs({
    page: query.page,
    page_size: query.page_size,
    search: query.search || undefined,
    sort_by: query.sort_by ? query.sort_by.split("_")[0] : undefined,
    sort_order: query.sort_by?.endsWith("_desc") ? "desc" : "asc",
  });

  // Delete mutation
  const deleteMutation = useDeleteAIConfig();

  const handleDelete = (id: number) => {
    const config = data?.data.configs.find((c: AIConfig) => c.id === id);
    if (config) {
      setDeletingConfig(config);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingConfig?.id) {
      await deleteMutation.mutateAsync(deletingConfig.id);
      setDeletingConfig(null);
    }
  };

  const handleEdit = (config: AIConfig) => {
    setEditingConfig(config);
    setEditOpen(true);
  };

  const handleEditDialogClose = (open: boolean) => {
    setEditOpen(open);
    if (!open) {
      setTimeout(() => setEditingConfig(null), 150);
    }
  };

  // Filter handlers
  const handleSearchChange = (value: string) => {
    setQuery({ search: value || undefined, page: 1 });
  };

  const handleSortChange = (value: string) => {
    setQuery({ sort_by: value || undefined, page: 1 });
  };

  const handleClearFilters = () => {
    setQuery({ search: undefined, sort_by: undefined, page: 1 });
  };

  // Column visibility handler
  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: visible,
    }));
  };

  if (error) {
    return <div className="p-4 text-destructive">Error: {error.message}</div>;
  }

  return (
    <div className="flex h-full bg-background">
      {/* Navigation Rail Filter */}
      <NavigationRailFilter
        searchPlaceholder="Tìm kiếm cấu hình..."
        onSearchChange={handleSearchChange}
        searchDebounceMs={500}
        selectLabel="Sắp xếp"
        selectOptions={sortOptions}
        selectValue={query.sort_by || undefined}
        onSelectChange={handleSortChange}
        onClearAll={handleClearFilters}
        onApplyFilters={() => {}}
        columnOptions={columnOptions}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={handleColumnVisibilityChange}
      />

      {/* Main Content */}
      <div className="flex-1 space-y-8 text-foreground animate-in fade-in duration-500 overflow-auto">
        <div className="@container/main px-4 py-4 lg:px-6 space-y-6">
          <AppBreadcrumb
            items={[
              {
                label: "Dashboard",
                href: "/",
                icon: <Home className="size-4" />,
              },
              {
                label: "Quản lý agent",
                href: "/ai-configs",
                icon: <IconRobot className="size-4" />,
              },
            ]}
          />

          <AIConfigsDataTableList
            configs={data?.data.configs || []}
            isLoading={isLoading}
            onDeleteConfig={handleDelete}
            onEditConfig={handleEdit}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={setColumnVisibility}
            pagination={{
              total: data?.data.total_records || 0,
              page: data?.data.current_page || 1,
              page_size: data?.data.page_size || 10,
              total_pages: data?.data.total_pages || 0,
            }}
          />
        </div>

        {/* Edit AI Config Dialog */}
        <AIConfigFormDialog
          open={editOpen}
          onOpenChange={handleEditDialogClose}
          config={editingConfig}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={!!deletingConfig}
          onOpenChange={(open) => !open && setDeletingConfig(null)}
          title="Xóa agent"
          description={
            <span>
              Bạn có chắc chắn muốn xóa agent{" "}
              <span className="font-semibold">{deletingConfig?.name}</span>?
              Hành động này không thể hoàn tác.
            </span>
          }
          confirmText="Xóa"
          cancelText="Hủy"
          onConfirm={handleConfirmDelete}
          confirmVariant="destructive"
        />
      </div>
    </div>
  );
}

export default function AIConfigsPage() {
  return (
    <ProtectedRoute requiredPermissions={[PERMISSIONS.VIEW_AI_CONFIGS]}>
      <AIConfigsPageContent />
    </ProtectedRoute>
  );
}
