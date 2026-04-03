"use client";

import { AppBreadcrumb } from "@/components/breadcrumb";
import { AIConfigDetailCard } from "@/features/sources/components/ai-config-detail-card";
import { useAIConfig } from "@/hooks/ai-configs/services";
import { useParams, useRouter } from "next/navigation";

import { toast } from "sonner";
import { FAQsDataTableList } from "@/features/faqs/components/faqs-data-table-list";
import { FAQFormDialog } from "@/features/faqs/components/faqs-form-modal";
import {
  AIConfigFeatureTab,
  AI_CONFIG_FEATURES,
} from "@/features/sources/components/ai-config-feature-tab";
import { motion, AnimatePresence } from "framer-motion";
import { useFaqs, useDeleteFaq } from "@/hooks/faqs/use-faqs";
import type { FAQ } from "@/features/faqs/utils/schema";
import { useQueryParam, NumberParam, withDefault } from "use-query-params";
import { PERMISSIONS } from "@/constants/permission";
import { EmptyData } from "@/components/empty-data";

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
import {
  DocumentsDashboardContent,
  useDocumentsDashboardController,
} from "@/features/documents/components/documents-dashboard";
import { useState, useEffect } from "react";
import { ShieldX } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Spinner } from "@/components/ui/spinner";
import { CodeBlockWidgetChat } from "@/features/source-code-ai-config/code-block-widget-chat";
import {
  ChatWithBotWidget,
  CW_AI_CONFIG_CHAT_TAB_BODY_CLASS,
} from "@/features/chat-with-bot-ai-config/chat-with-bot-widget";

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

  const { hasAnyPermission, isLoading: isAuthLoading } = useAuth();
  const canViewSource = hasAnyPermission([PERMISSIONS.VIEW_SOURCES]);
  const canViewFaqs = hasAnyPermission([PERMISSIONS.VIEW_FAQS]);

  // Filter + pagination state for FAQs
  const [faqsSearch, setFaqsSearch] = useState("");
  const [faqsSort, setFaqsSort] = useState<string | undefined>();
  const [faqsColumnVisibility, setFaqsColumnVisibility] = useState<
    Record<string, boolean>
  >({});
  const [faqsPage] = useQueryParam("faq_page", withDefault(NumberParam, 1));
  const [faqsPageSize] = useQueryParam(
    "faq_page_size",
    withDefault(NumberParam, 10),
  );

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

  const faqsSortParams = parseSort(faqsSort);

  // Fetch FAQs for this AI config
  const { data: faqsResponse, isLoading: isLoadingFaqs } = useFaqs({
    ai_config_id: aiconfigId,
    page: faqsPage,
    page_size: faqsPageSize,
    search: faqsSearch || undefined,
    sort_by: faqsSortParams.sort_by,
    sort_order: faqsSortParams.sort_order,
  });

  const config = data?.data ?? null;

  // FAQs Data Processing
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
    toast.info(`Chỉnh sửa cấu hình: ${config.name}`);
    router.push(`/ai-configs?edit=${config.id}`);
  };

  // State for feature tabs
  const [activeFeature, setActiveFeature] = useState<string | null>("source");

  /** Ẩn bubble widget ngay khi đổi tab (không chờ AnimatePresence unmount ChatWithBotWidget). */
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (activeFeature === "chat") {
      document.body.classList.add(CW_AI_CONFIG_CHAT_TAB_BODY_CLASS);
    } else {
      document.body.classList.remove(CW_AI_CONFIG_CHAT_TAB_BODY_CLASS);
    }
    return () => {
      document.body.classList.remove(CW_AI_CONFIG_CHAT_TAB_BODY_CLASS);
    };
  }, [activeFeature]);

  const documentsController = useDocumentsDashboardController({
    paramSource: "local",
    enabled: activeFeature === "source" && canViewSource,
  });

  const handleSearchChange = (value: string) => {
    if (activeFeature === "faqs") {
      setFaqsSearch(value);
    }
  };

  const handleSortChange = (value: string) => {
    if (activeFeature === "faqs") {
      setFaqsSort(value || undefined);
    }
  };

  const handleClearFilters = () => {
    if (activeFeature === "faqs") {
      setFaqsSearch("");
      setFaqsSort(undefined);
    }
  };

  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
    if (activeFeature === "faqs") {
      setFaqsColumnVisibility((prev) => ({ ...prev, [columnId]: visible }));
    }
  };

  const currentSearchPlaceholder =
    activeFeature === "faqs" ? "Tìm kiếm FAQ..." : "Tìm kiếm...";

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

  const widgetApiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://hau.telesip.vn/api/v1";

  const renderFeatureContent = () => {
    switch (activeFeature) {
      case "integration":
        return (
          <div className="h-full min-w-0 w-full">
            <CodeBlockWidgetChat
              aiConfigId={aiconfigId}
              apiBaseUrl={widgetApiBaseUrl}
            />
          </div>
        );
      case "chat":
        return (
          <div className="h-full min-w-0 w-full">
            <ChatWithBotWidget
              aiConfigId={aiconfigId}
              apiBaseUrl={widgetApiBaseUrl}
            />
          </div>
        );
      case "faqs":
        if (isAuthLoading) {
          return (
            <div className="flex min-h-[min(70vh,720px)] w-full items-center justify-center p-6">
              <Spinner className="size-8 text-primary" />
            </div>
          );
        }
        if (!canViewFaqs) {
          return (
            <EmptyData
              icon={ShieldX}
              title="403"
              description="Bạn không có quyền truy cập FAQ."
              showButton={false}
              className="w-full"
            />
          );
        }
        return (
          <div className="h-full min-w-0">
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
      default: {
        const feature = AI_CONFIG_FEATURES.find((f) => f.id === activeFeature);
        if (!feature) return null;
        const Icon = feature.icon;
        return (
          <div className="flex flex-col items-center justify-center text-center h-full min-h-[300px]">
            <Icon className="mb-4 h-16 w-16 text-muted-foreground/50" />
            <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
            <p className="text-muted-foreground max-w-sm">
              {feature.description || "Tính năng đang được phát triển."}
            </p>
          </div>
        );
      }
    }
  };

  const handleConfirmDeleteFaq = async () => {
    if (deleteFaqId) {
      try {
        const response: any = await deleteFaqMutation.mutateAsync(deleteFaqId);
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
    <div className="flex flex-col gap-6 px-4 py-4 lg:px-6 min-w-0">
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
            className="min-w-0 w-full overflow-hidden"
          >
            <div className="min-w-0 border rounded-xl bg-card shadow-sm overflow-hidden">
              {activeFeature === "source" ? (
                isAuthLoading ? (
                  <div className="flex min-h-[min(70vh,720px)] w-full items-center justify-center p-6">
                    <Spinner className="size-8 text-primary" />
                  </div>
                ) : canViewSource ? (
                  <div className="flex min-h-[min(70vh,720px)] w-full">
                    <NavigationRailFilter
                      className="shrink-0  border-border min-h-[min(70vh,720px)]"
                      verticalDockPositionClassName="px-2"
                      {...documentsController.railProps}
                    />
                    <DocumentsDashboardContent
                      controller={documentsController}
                      showBreadcrumb={false}
                      className="min-w-0 flex-1"
                    />
                  </div>
                ) : (
                  <div className="flex min-h-[min(70vh,720px)] w-full items-center justify-center p-6">
                    <EmptyData
                      icon={ShieldX}
                      title="403"
                      description="Bạn không có quyền truy cập nguồn dữ liệu."
                      showButton={false}
                      className="max-w-[520px] w-full"
                    />
                  </div>
                )
              ) : activeFeature === "faqs" ? (
                <div className="flex min-h-[min(70vh,720px)] w-full">
                  <NavigationRailFilter
                    className="shrink-0 border-border min-h-[min(70vh,720px)]"
                    verticalDockPositionClassName="px-2"
                    searchPlaceholder={currentSearchPlaceholder}
                    onSearchChange={handleSearchChange}
                    searchDebounceMs={500}
                    selectLabel="Sắp xếp"
                    selectOptions={faqsSortOptions}
                    selectValue={faqsSort}
                    onSelectChange={handleSortChange}
                    onClearAll={handleClearFilters}
                    columnOptions={faqsColumnOptions}
                    columnVisibility={faqsColumnVisibility}
                    onColumnVisibilityChange={handleColumnVisibilityChange}
                  />
                  <div className="min-w-0 flex-1 overflow-hidden p-6">
                    {renderFeatureContent()}
                  </div>
                </div>
              ) : (
                <div className="w-full overflow-auto p-6">
                  {renderFeatureContent()}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
