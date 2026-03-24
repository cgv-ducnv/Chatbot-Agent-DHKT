"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DocumentItem } from "@/services/documents/services";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, FileText, GripVertical, Hash, Layers } from "lucide-react";
import { useState } from "react";
import { useTrackDocumentStatus } from "@/hooks/documents/use-documents";
import { DocumentDetailByTrack } from "./document-detail-by-track";
import type { TrackStatusResponse } from "./document-detail-by-track";
import { TooltipContent } from "@/components/ui/tooltip";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";

interface DocumentKabanCardProps {
  document: Omit<DocumentItem, "status"> & { status: string };
  draggable?: boolean;
}

function statusConfig(status: string) {
  const s = status.toLowerCase();
  if (s === "processed") {
    return {
      color: "bg-emerald-500",
      bg: "bg-emerald-500/10",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-500/30",
      label: "Đã xử lý",
    };
  }
  if (s === "processing") {
    return {
      color: "bg-amber-500",
      bg: "bg-amber-500/10",
      text: "text-amber-700 dark:text-amber-300",
      border: "border-amber-500/30",
      label: "Đang xử lý",
    };
  }
  if (s === "failed") {
    return {
      color: "bg-red-500",
      bg: "bg-red-500/10",
      text: "text-red-700 dark:text-red-300",
      border: "border-red-500/30",
      label: "Lỗi",
    };
  }
  if (s === "preprocessed") {
    return {
      color: "bg-violet-500",
      bg: "bg-violet-500/10",
      text: "text-violet-700 dark:text-violet-300",
      border: "border-violet-500/30",
      label: "Tiền xử lý",
    };
  }
  return {
    color: "bg-sky-500",
    bg: "bg-sky-500/10",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-500/30",
    label: "Chờ xử lý",
  };
}

export function DocumentKabanCard({
  document,
  draggable = true,
}: DocumentKabanCardProps) {
  const status = statusConfig(document.status ?? "pending");
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: document.id,
    disabled: !draggable,
    data: {
      type: "document",
      document,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const {
    data: trackStatus,
    isLoading: isTrackStatusLoading,
    isFetching: isTrackStatusFetching,
  } = useTrackDocumentStatus(selectedTrackId);

  const trackStatusPayload: TrackStatusResponse | null =
    trackStatus && typeof trackStatus === "object"
      ? {
          track_id: (trackStatus as { track_id: string }).track_id,
          documents:
            (trackStatus as { documents?: DocumentItem[] }).documents ?? [],
          total_count:
            (trackStatus as { total_count?: number }).total_count ?? 0,
          status_summary:
            (
              trackStatus as {
                status_summary?: TrackStatusResponse["status_summary"];
              }
            ).status_summary ?? {},
        }
      : null;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative overflow-hidden border-none py-3 shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 bg-white dark:bg-zinc-900",
        draggable && "cursor-grab",
        isDragging && "opacity-50 ring-2 ring-primary shadow-2xl scale-105",
      )}
    >
      <div className={cn("absolute inset-y-0 left-0 w-1", status.color)} />

      <CardContent className="space-y-3 px-4">
        <div className="flex items-start justify-between gap-3">
          <h4 className="flex-1 truncate text-[13px] font-bold leading-snug text-zinc-800 dark:text-zinc-200">
            {document.track_id}
          </h4>
          <div className="flex items-center gap-1">
            <Badge
              variant="outline"
              className={cn(
                "h-5 px-1.5 text-[10px] font-semibold",
                status.text,
              )}
            >
              {status.label}
            </Badge>
            {draggable && (
              <button
                {...attributes}
                {...listeners}
                className="text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100 hover:text-zinc-500 shrink-0 cursor-grab touch-none"
                type="button"
              >
                <GripVertical className="size-4" />
              </button>
            )}
          </div>
        </div>

        <p className="text-zinc-500 line-clamp-2 text-xs leading-relaxed">
          {document.content_summary || "Không có tóm tắt"}
        </p>

        <div className="space-y-2 text-[11px] text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <FileText className="size-3.5 shrink-0" />
            <span className="truncate">{document.file_path || "—"}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <Layers className="size-3.5 shrink-0" />
              {document.chunks_count} chunks
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Hash className="size-3.5 shrink-0" />
              {document.id.slice(0, 8)}
            </span>
          </div>
        </div>

        <div
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 border shadow-xs",
            status.bg,
            status.border,
          )}
        >
          <div
            className={cn("size-1.5 rounded-full animate-pulse", status.color)}
          />
          <span className={cn("text-[10px] font-bold", status.text)}>
            {document.status}
          </span>
        </div>
        {draggable && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0 absolute bottom-5 right-4"
                  onClick={() => {
                    setSelectedTrackId(document.track_id);
                    setDetailOpen(true);
                  }}
                  aria-label="Xem chi tiết theo track_id"
                >
                  <Eye className="size-3.5" />
                </Button>
              </TooltipTrigger>

              <TooltipContent side="top">Xem chi tiết</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardContent>

      <DocumentDetailByTrack
        open={detailOpen}
        onOpenChange={(next) => {
          setDetailOpen(next);
          if (!next) setSelectedTrackId(null);
        }}
        trackId={selectedTrackId}
        trackStatus={trackStatusPayload}
        isLoading={isTrackStatusLoading}
        isFetching={isTrackStatusFetching}
      />
    </Card>
  );
}
