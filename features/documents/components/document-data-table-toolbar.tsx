"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw, ScanSearch, RotateCcw } from "lucide-react";
import {
  useScanNewDocuments,
  useReprocessFailedDocuments,
} from "@/hooks/documents/use-documents";
import { toast } from "sonner";
import { DocumentUploadButton } from "./document-upload-button";

interface DocumentDataTableToolbarProps {
  title?: string;
  description?: string;
}

export function DocumentDataTableToolbar({
  title = "Danh sách tài liệu",
  description = "Tài liệu đã đưa vào hệ thống hỏi đáp — phân trang và lọc theo trạng thái.",
}: DocumentDataTableToolbarProps) {
  const scan = useScanNewDocuments();
  const reprocess = useReprocessFailedDocuments();

  const handleScan = async () => {
    try {
      const response = await scan.mutateAsync();
      if (response.status === "scanning_started") {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error("Không thể quét thư mục.");
    }
  };

  const handleReprocess = async () => {
    try {
      const response = await reprocess.mutateAsync();
      if (response.status === "reprocessing_started") {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error("Không thể xử lý lại tài liệu lỗi.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DocumentUploadButton />
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            disabled={scan.isPending}
            onClick={handleScan}
          >
            <ScanSearch className="size-4 mr-2" />
            Quét thư mục
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="cursor-pointer"
            disabled={reprocess.isPending}
            onClick={handleReprocess}
          >
            <RotateCcw className="size-4 mr-2" />
            Xử lý lại lỗi
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="size-4 mr-2" />
            Tải lại trang
          </Button>
        </div>
      </div>
    </div>
  );
}
