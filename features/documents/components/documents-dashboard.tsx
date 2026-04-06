"use client";

import { DocumentDataTable } from "@/features/documents/components/document-data-table";
import { DocumentKabanBoard } from "@/features/documents/components/document-kaban-board";
import { DocumentPipelineBanner } from "@/features/documents/components/document-pipeline-banner";
import { DocumentStateCards } from "@/features/documents/components/document-state-cards";
import { NavigationRailFilter } from "@/components/navigation-rail-filter";
import { AppBreadcrumb } from "@/components/breadcrumb";
import { Home } from "lucide-react";
import { IconFileStack } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  useDocumentsDashboardController,
  type DocumentsDashboardController,
} from "@/features/documents/hooks/use-documents-dashboard-controller";

export type DocumentsDashboardProps = {
  /**
   * `url` — đồng bộ query giống trang /documents.
   * `local` — state nội bộ (nhúng trong trang khác, không đụng URL).
   */
  paramSource?: "url" | "local";
  showBreadcrumb?: boolean;
  className?: string;
};

export function DocumentsDashboardContent({
  controller,
  showBreadcrumb = true,
  className,
}: {
  controller: DocumentsDashboardController;
  showBreadcrumb?: boolean;
  className?: string;
}) {
  const { documents, pagination, isLoading, isKanbanMode, query, patchQuery } =
    controller;

  return (
    <div
      className={cn(
        "min-w-0 flex-1 space-y-8 overflow-auto text-foreground animate-in fade-in duration-500",
        className,
      )}
    >
      <div className="@container/main space-y-6 px-4 py-4 lg:px-6">
        {showBreadcrumb && (
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
        )}

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
            page={query.page}
            pageSize={query.page_size}
            onPageChange={(p) =>
              patchQuery({ page: p != null && p > 0 ? p : 1 })
            }
            onPageSizeChange={(size) =>
              patchQuery({
                page_size: size != null && size > 0 ? size : query.page_size,
                page: 1,
              })
            }
          />
        )}
      </div>
    </div>
  );
}

export function DocumentsDashboard({
  paramSource = "url",
  showBreadcrumb = true,
  className,
}: DocumentsDashboardProps) {
  const controller = useDocumentsDashboardController({
    paramSource,
    enabled: true,
  });

  return (
    <div className={cn("flex h-full min-h-0 w-full bg-background", className)}>
      <NavigationRailFilter
        className="min-h-0 shrink-0 border-r border-border"
        {...controller.railProps}
      />
      <DocumentsDashboardContent
        controller={controller}
        showBreadcrumb={showBreadcrumb}
      />
    </div>
  );
}

export { useDocumentsDashboardController } from "@/features/documents/hooks/use-documents-dashboard-controller";
export type { DocumentsDashboardController } from "@/features/documents/hooks/use-documents-dashboard-controller";
