"use client";

import { AppBreadcrumb } from "@/components/breadcrumb";
import { AIConfigDetailCard } from "@/features/sources/components/ai-config-detail-card";
import { useAIConfig } from "@/hooks/ai-configs/services";
import { useParams, useRouter } from "next/navigation";

import { toast } from "sonner";
import { DataTable } from "@/features/sources/components/sources-table-data-list";
import { useSources } from "@/hooks/sources/use-sources";
import type { Sources } from "@/features/sources/utils/schema";
import { useState } from "react";
import { SourcesFormDialog } from "@/features/sources/components/sources-form-modal";
import { useDeleteSource } from "@/hooks/sources/use-sources";
import { FAQsDataTableList } from "@/features/faqs/components/faqs-data-table-list";
import { FAQFormDialog } from "@/features/faqs/components/faqs-form-modal";
import {
  AIConfigFeatureTab,
  AI_CONFIG_FEATURES,
} from "@/features/sources/components/ai-config-feature-tab";
import { motion, AnimatePresence } from "framer-motion";
import { useFaqs, useDeleteFaq } from "@/hooks/faqs/use-faqs";
import type { FAQ } from "@/features/faqs/utils/schema";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  NavigationRailFilter,
  type FilterOption,
  type ColumnOption,
} from "@/components/navigation-rail-filter";
import { AIConfig } from "@/features/ai-configs/utils/schema";
import { ArrowUpAZ, ArrowDownAZ, Clock } from "lucide-react";

// Sort options for Sources
const sourcesSortOptions: FilterOption[] = [
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

// Sort options for FAQs
const faqsSortOptions: FilterOption[] = [
  {
    value: "question_asc",
    label: "Câu hỏi A-Z",
    icon: <ArrowUpAZ className="size-4" />,
  },
  {
    value: "question_desc",
    label: "Câu hỏi Z-A",
    icon: <ArrowDownAZ className="size-4" />,
  },
  {
    value: "priority_desc",
    label: "Ưu tiên cao",
    icon: <Clock className="size-4" />,
  },
  {
    value: "priority_asc",
    label: "Ưu tiên thấp",
    icon: <Clock className="size-4" />,
  },
  {
    value: "created_at_desc",
    label: "Mới nhất",
    icon: <Clock className="size-4" />,
  },
];

// Column options for Sources
const sourcesColumnOptions: ColumnOption[] = [
  { id: "name", label: "Tên nguồn" },
  { id: "type", label: "Loại" },
  { id: "status", label: "Trạng thái" },
  { id: "created_at", label: "Ngày tạo" },
];

// Column options for FAQs
const faqsColumnOptions: ColumnOption[] = [
  { id: "question", label: "Câu hỏi" },
  { id: "answer", label: "Câu trả lời" },
  { id: "intent", label: "Intent" },
  { id: "priority", label: "Độ ưu tiên" },
];

export default function AIConfigDetailPage() {
  const params = useParams();
  const router = useRouter();
  const aiconfigId = Number(params.aiconfigId);

  const { data, isLoading, error } = useAIConfig(aiconfigId);

  // Filter state for Sources
  const [sourcesSearch, setSourcesSearch] = useState("");
  const [sourcesSort, setSourcesSort] = useState<string | undefined>();
  const [sourcesColumnVisibility, setSourcesColumnVisibility] = useState<
    Record<string, boolean>
  >({});

  // Filter state for FAQs
  const [faqsSearch, setFaqsSearch] = useState("");
  const [faqsSort, setFaqsSort] = useState<string | undefined>();
  const [faqsColumnVisibility, setFaqsColumnVisibility] = useState<
    Record<string, boolean>
  >({});

  // Parse sort value to sort_by and sort_order
  const parseSort = (sortValue?: string) => {
    if (!sortValue) return { sort_by: undefined, sort_order: undefined };
    const lastUnderscoreIndex = sortValue.lastIndexOf("_");
    if (lastUnderscoreIndex === -1)
      return { sort_by: sortValue, sort_order: undefined };
    const sort_by = sortValue.substring(0, lastUnderscoreIndex);
    const sort_order = sortValue.substring(lastUnderscoreIndex + 1) as
      | "asc"
      | "desc";
    return { sort_by, sort_order };
  };

  const sourcesSortParams = parseSort(sourcesSort);
  const faqsSortParams = parseSort(faqsSort);

  // Fetch sources for this AI config
  const { data: sourcesData, isLoading: isLoadingSources } = useSources({
    ai_config_id: aiconfigId,
    search: sourcesSearch || undefined,
    sort_by: sourcesSortParams.sort_by,
    sort_order: sourcesSortParams.sort_order,
  });

  // Fetch FAQs for this AI config
  const { data: faqsResponse, isLoading: isLoadingFaqs } = useFaqs({
    ai_config_id: aiconfigId,
    search: faqsSearch || undefined,
    sort_by: faqsSortParams.sort_by,
    sort_order: faqsSortParams.sort_order,
  });

  const config = data?.data ?? null;

  // Sources Data Processing
  const sourcesListData = sourcesData;
  const sources = sourcesListData?.data.data.sources ?? [];
  const pagination = sourcesListData
    ? {
        total: sourcesListData.data.data.total_records,
        page: sourcesListData.data.data.current_page,
        page_size: sourcesListData.data.data.page_size,
        total_pages: sourcesListData.data.data.total_pages,
      }
    : undefined;

  // FAQs Data Processing
  // Assuming the response structure matches sources (data.data.faqs or data.data.items)
  // Adjust 'faqs' accessor if API response differs
  const faqsListData = faqsResponse?.data;
  const faqs =
    (faqsListData?.data as any)?.faqs ??
    (faqsListData?.data as any)?.items ??
    [];

  const faqPagination = faqsListData
    ? {
        total: (faqsListData.data as any).total_records ?? 0,
        page: (faqsListData.data as any).current_page ?? 1,
        page_size: (faqsListData.data as any).page_size ?? 10,
        total_pages: (faqsListData.data as any).total_pages ?? 1,
      }
    : undefined;

  const handleEdit = (config: AIConfig) => {
    // Navigate back to list with edit modal, or handle inline edit
    toast.info(`Chỉnh sửa cấu hình: ${config.name}`);
    // You can implement edit modal logic here or navigate
    router.push(`/ai-configs?edit=${config.id}`);
  };

  // State for edit modal
  const [editingSource, setEditingSource] = useState<Sources | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditSource = (source: Sources) => {
    setEditingSource(source);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = (open: boolean) => {
    setIsEditModalOpen(open);
    if (!open) {
      setEditingSource(null);
    }
  };

  // State for feature tabs
  const [activeFeature, setActiveFeature] = useState<string | null>("source");

  // Filter handlers based on active tab
  const handleSearchChange = (value: string) => {
    if (activeFeature === "source") {
      setSourcesSearch(value);
    } else if (activeFeature === "faqs") {
      setFaqsSearch(value);
    }
  };

  const handleSortChange = (value: string) => {
    if (activeFeature === "source") {
      setSourcesSort(value || undefined);
    } else if (activeFeature === "faqs") {
      setFaqsSort(value || undefined);
    }
  };

  const handleClearFilters = () => {
    if (activeFeature === "source") {
      setSourcesSearch("");
      setSourcesSort(undefined);
    } else if (activeFeature === "faqs") {
      setFaqsSearch("");
      setFaqsSort(undefined);
    }
  };

  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
    if (activeFeature === "source") {
      setSourcesColumnVisibility((prev) => ({ ...prev, [columnId]: visible }));
    } else if (activeFeature === "faqs") {
      setFaqsColumnVisibility((prev) => ({ ...prev, [columnId]: visible }));
    }
  };

  // Get current filter values based on active tab
  const currentSearchPlaceholder =
    activeFeature === "source"
      ? "Tìm kiếm nguồn dữ liệu..."
      : activeFeature === "faqs"
        ? "Tìm kiếm FAQ..."
        : "Tìm kiếm...";

  const currentSortOptions =
    activeFeature === "source" ? sourcesSortOptions : faqsSortOptions;

  const currentSortValue = activeFeature === "source" ? sourcesSort : faqsSort;

  const currentColumnOptions =
    activeFeature === "source" ? sourcesColumnOptions : faqsColumnOptions;

  const currentColumnVisibility =
    activeFeature === "source" ? sourcesColumnVisibility : faqsColumnVisibility;

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const deleteSourceMutation = useDeleteSource();

  const handleDeleteSource = (id: number) => {
    setDeleteId(id);
  };

  // State for FAQ actions
  const [deleteFaqId, setDeleteFaqId] = useState<number | null>(null);
  const deleteFaqMutation = useDeleteFaq();

  const handleDeleteFaq = (id: number) => {
    setDeleteFaqId(id);
  };

  // State for FAQ edit modal
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [isFaqEditModalOpen, setIsFaqEditModalOpen] = useState(false);

  const handleEditFaq = (faq: FAQ) => {
    setEditingFaq(faq);
    setIsFaqEditModalOpen(true);
  };

  const handleFaqEditModalClose = (open: boolean) => {
    setIsFaqEditModalOpen(open);
    if (!open) {
      setEditingFaq(null);
    }
  };

  // State for FAQ add modal
  const [isFaqAddModalOpen, setIsFaqAddModalOpen] = useState(false);

  const handleAddFaq = () => {
    setIsFaqAddModalOpen(true);
  };

  const renderFeatureContent = () => {
    switch (activeFeature) {
      case "source":
        return (
          <div className="h-full">
            <DataTable
              sources={sources}
              onDeleteSource={handleDeleteSource}
              onEditSource={handleEditSource}
              pagination={pagination}
              isLoading={isLoadingSources}
            />
          </div>
        );
      case "faqs":
        return (
          <div className="h-full">
            <FAQsDataTableList
              faqs={faqs}
              isLoading={isLoadingFaqs}
              pagination={faqPagination}
              onDeleteFaq={handleDeleteFaq}
              onEditFaq={handleEditFaq}
              onAddFaq={handleAddFaq}
            />
          </div>
        );
      default:
        const feature = AI_CONFIG_FEATURES.find((f) => f.id === activeFeature);
        if (!feature) return null;
        const Icon = feature.icon;
        return (
          <div className="flex flex-col items-center justify-center text-center h-full min-h-[300px]">
            <Icon className="mb-4 h-16 w-16 text-muted-foreground/50" />
            <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
            <p className="text-muted-foreground max-w-sm">
              {activeFeature === "chat"
                ? `Tính năng chat đang được phát triển. Bạn sẽ sớm có thể trò chuyện với ${config?.name || "Agent"} tại đây.`
                : feature.description || "Tính năng đang được phát triển."}
            </p>
          </div>
        );
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      try {
        const response: any = await deleteSourceMutation.mutateAsync(deleteId);
        if (response.data.status_code === 200) {
          toast.success("Xóa nguồn dữ liệu thành công!");
        } else {
          toast.error(response.data.message || "Xóa nguồn dữ liệu thất bại!");
        }
      } catch (error) {
        toast.error("Xóa nguồn dữ liệu thất bại!");
      } finally {
        setDeleteId(null);
      }
    }
  };

  const handleConfirmDeleteFaq = async () => {
    if (deleteFaqId) {
      try {
        const response: any = await deleteFaqMutation.mutateAsync(deleteFaqId);
        // Check response structure. Assuming similar to deleteSource
        if (response && response.data.status_code == 200) {
          toast.success("Xóa FAQ thành công!");
        } else {
          toast.error(response.message || "Xóa FAQ thất bại!");
        }
      } catch (error) {
        toast.error("Xóa FAQ thất bại!");
      } finally {
        setDeleteFaqId(null);
      }
    }
  };

  if (error) {
    toast.error("Không thể tải thông tin cấu hình AI");
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-4 lg:px-6">
      {/* Breadcrumb */}
      <AppBreadcrumb
        items={[
          {
            label: "Dashboard",
            href: "/dashboard",
          },
          {
            label: "Cấu hình AI",
            href: "/ai-configs",
          },
          {
            label: config?.name || "Chi tiết",
            href: `/ai-configs/${aiconfigId}`,
          },
        ]}
      />

      {/* Main Content - 50-50 Layout */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
        {/* Left: Detail Card (50%) */}
        <div className="flex-1">
          <AIConfigDetailCard
            config={config}
            isLoading={isLoading}
            onEdit={handleEdit}
          />
        </div>

        {/* Right: Feature Tabs (50%) */}
        <div className="flex-1 h-full">
          <AIConfigFeatureTab
            activeFeature={activeFeature}
            onFeatureChange={setActiveFeature}
          />
        </div>
      </div>

      {/* Feature Content (Full Width) */}
      <AnimatePresence mode="wait">
        {activeFeature && (
          <motion.div
            key={activeFeature}
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden w-full"
          >
            <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
              <NavigationRailFilter
                position="left"
                searchPlaceholder={currentSearchPlaceholder}
                onSearchChange={handleSearchChange}
                searchDebounceMs={500}
                selectLabel="Sắp xếp"
                selectOptions={currentSortOptions}
                selectValue={currentSortValue}
                onSelectChange={handleSortChange}
                onClearAll={handleClearFilters}
                columnOptions={currentColumnOptions}
                columnVisibility={currentColumnVisibility}
                onColumnVisibilityChange={handleColumnVisibilityChange}
              >
                <div className="p-6">{renderFeatureContent()}</div>
              </NavigationRailFilter>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Source Modal */}
      <SourcesFormDialog
        source={editingSource}
        open={isEditModalOpen}
        onOpenChange={handleEditModalClose}
        aiConfigId={aiconfigId}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bạn có chắc chắn muốn xóa?</DialogTitle>
            <DialogDescription>
              Hành động này không thể hoàn tác. Nguồn dữ liệu sẽ bị xóa vĩnh
              viễn khỏi hệ thống.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Hủy
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white"
              disabled={deleteSourceMutation.isPending}
            >
              {deleteSourceMutation.isPending ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete FAQ Confirmation Dialog */}
      <Dialog
        open={!!deleteFaqId}
        onOpenChange={(open) => !open && setDeleteFaqId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bạn có chắc chắn muốn xóa FAQ này?</DialogTitle>
            <DialogDescription>
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteFaqId(null)}>
              Hủy
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDeleteFaq();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white"
              disabled={deleteFaqMutation.isPending}
            >
              {deleteFaqMutation.isPending ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit FAQ Modal */}
      <FAQFormDialog
        faq={editingFaq}
        open={isFaqEditModalOpen}
        onOpenChange={handleFaqEditModalClose}
        aiConfigId={aiconfigId}
      />

      {/* Add FAQ Modal */}
      <FAQFormDialog
        open={isFaqAddModalOpen}
        onOpenChange={setIsFaqAddModalOpen}
        aiConfigId={aiconfigId}
      />
    </div>
  );
}
