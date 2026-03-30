"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDocumentPipelineStatus } from "@/hooks/documents/use-documents";
import { cn } from "@/lib/utils";
import type {
  PipelineStatusResponse,
  PipelineUpdateStatus,
} from "@/services/documents/services";
import {
  Activity,
  ChevronDown,
  Loader2,
  CalendarClock,
  Layers,
  ListOrdered,
} from "lucide-react";
import { useMemo, useState } from "react";

const UPDATE_LABELS: Record<keyof PipelineUpdateStatus, string> = {
  full_docs: "Full docs",
  text_chunks: "Text chunks",
  full_entities: "Full entities",
  full_relations: "Full relations",
  entity_chunks: "Entity chunks",
  relation_chunks: "Relation chunks",
  entities: "Entities",
  relationships: "Relationships",
  chunks: "Chunks",
  chunk_entity_relation: "Chunk–entity–rel",
  llm_response_cache: "LLM cache",
  doc_status: "Doc status",
};

function boolProgress(arr: boolean[] | undefined) {
  if (!arr?.length) return "—";
  const ok = arr.filter(Boolean).length;
  return `${ok}/${arr.length}`;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("vi-VN", {
      dateStyle: "short",
      timeStyle: "medium",
    });
  } catch {
    return iso;
  }
}

export function DocumentPipelineBanner() {
  const { data, isLoading } = useDocumentPipelineStatus();
  const status = data as PipelineStatusResponse | undefined;
  const [open, setOpen] = useState(false);

  const updateEntries = useMemo(() => {
    if (!status?.update_status) return [];
    return (Object.keys(UPDATE_LABELS) as (keyof PipelineUpdateStatus)[]).map(
      (key) => ({
        key,
        label: UPDATE_LABELS[key],
        progress: boolProgress(status.update_status[key]),
      }),
    );
  }, [status?.update_status]);

  if (isLoading || !status) {
    return (
      <Alert className="border-dashed border-sky-200/70 bg-sky-50/40 dark:border-sky-800/50 dark:bg-sky-950/20">
        <Loader2 className="size-4 animate-spin text-sky-600 dark:text-sky-400" />
        <AlertTitle>Pipeline</AlertTitle>
        <AlertDescription>Đang tải trạng thái xử lý…</AlertDescription>
      </Alert>
    );
  }

  const busy = status.busy;

  return (
    <Alert
      className={cn(
        "overflow-hidden border transition-colors",
        busy
          ? "border-amber-300/50 bg-linear-to-br from-amber-50/90 via-orange-50/50 to-rose-50/40 dark:border-amber-700/40 dark:from-amber-950/35 dark:via-orange-950/25 dark:to-rose-950/20"
          : "border-sky-200/55 bg-linear-to-br from-sky-50/70 via-violet-50/35 to-emerald-50/30 dark:border-sky-800/40 dark:from-sky-950/30 dark:via-violet-950/20 dark:to-emerald-950/15",
      )}
    >
      <Activity
        className={cn(
          "size-4 shrink-0",
          busy
            ? "text-amber-600 dark:text-amber-400"
            : "text-sky-600 dark:text-sky-400",
        )}
      />
      <div className="col-start-2 min-w-0 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <AlertTitle className="flex flex-wrap items-center gap-2 text-base">
            Pipeline
            {busy ? (
              <Badge className="border-amber-200/80 bg-amber-100/90 font-normal text-amber-900 shadow-none dark:border-amber-800/60 dark:bg-amber-950/60 dark:text-amber-100">
                Đang hoạt động
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="border-emerald-200/70 bg-emerald-100/70 font-normal text-emerald-900 dark:border-emerald-800/50 dark:bg-emerald-950/50 dark:text-emerald-100"
              >
                Tạm ngưng
              </Badge>
            )}
            <Badge
              variant="outline"
              className={cn(
                "font-normal",
                status.autoscanned
                  ? "border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-100"
                  : "border-muted-foreground/25 bg-muted/40 text-muted-foreground",
              )}
            >
              Autoscan: {status.autoscanned ? "bật" : "tắt"}
            </Badge>
          </AlertTitle>
        </div>

        <AlertDescription className="space-y-2 text-xs sm:text-sm">
          <p className="text-foreground/90">
            {status.latest_message || "Không có thông báo mới."}
          </p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Layers className="size-3.5 text-sky-500/80" />
              Khối: {status.cur_batch}/{status.batchs}
            </span>
            <span>·</span>
            <span>Tài liệu: {status.docs}</span>
          </p>
        </AlertDescription>

        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 px-2 text-xs text-sky-700 hover:bg-sky-100/80 dark:text-sky-300 dark:hover:bg-sky-950/50"
            >
              <ListOrdered className="size-3.5" />
              {open ? "Thu gọn chi tiết" : "Xem tất cả dữ liệu"}
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform duration-200",
                  open && "rotate-180",
                )}
              />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0">
            <div className="mt-3 space-y-4 rounded-lg border border-sky-100/80 bg-white/50 p-3 shadow-sm dark:border-sky-900/50 dark:bg-background/40">
              <div className="grid gap-2 text-xs sm:grid-cols-2">
                <div className="rounded-md bg-violet-50/80 px-2.5 py-2 dark:bg-violet-950/30">
                  <p className="font-medium text-violet-900 dark:text-violet-100">
                    Tên job
                  </p>
                  <p className="mt-0.5 break-all text-muted-foreground">
                    {status.job_name || "—"}
                  </p>
                </div>
                <div className="rounded-md bg-emerald-50/70 px-2.5 py-2 dark:bg-emerald-950/25">
                  <p className="flex items-center gap-1 font-medium text-emerald-900 dark:text-emerald-100">
                    <CalendarClock className="size-3.5" />
                    Bắt đầu
                  </p>
                  <p className="mt-0.5 text-muted-foreground">
                    {formatDate(status.job_start)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <Badge
                  variant="outline"
                  className="border-rose-200/80 bg-rose-50/60 font-normal text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-100"
                >
                  Chờ request: {String(status.request_pending)}
                </Badge>
                {status.pending_requests !== undefined && (
                  <Badge
                    variant="outline"
                    className="border-cyan-200/70 bg-cyan-50/60 font-normal text-cyan-900 dark:border-cyan-900/50 dark:bg-cyan-950/30 dark:text-cyan-100"
                  >
                    Pending requests: {String(status.pending_requests)}
                  </Badge>
                )}
                {status.cancellation_requested !== undefined && (
                  <Badge
                    variant="outline"
                    className="border-orange-200/80 bg-orange-50/60 font-normal text-orange-900 dark:border-orange-900/50 dark:bg-orange-950/30 dark:text-orange-100"
                  >
                    Yêu cầu hủy: {String(status.cancellation_requested)}
                  </Badge>
                )}
              </div>

              <div>
                <p className="mb-2 text-xs font-medium text-foreground/80">
                  Lịch sử thông báo
                </p>
                <ScrollArea className="h-[min(220px,40vh)] rounded-md border border-sky-100/90 bg-sky-50/30 pr-3 dark:border-sky-900/40 dark:bg-sky-950/20">
                  <ol className="space-y-1.5 p-2 text-xs leading-relaxed">
                    {status.history_messages?.length ? (
                      status.history_messages.map((msg, i) => (
                        <li
                          key={`${i}-${msg.slice(0, 24)}`}
                          className={cn(
                            "rounded px-2 py-1.5",
                            i % 2 === 0
                              ? "bg-white/60 dark:bg-background/30"
                              : "bg-violet-50/40 dark:bg-violet-950/15",
                          )}
                        >
                          <span className="mr-2 font-mono text-[10px] text-muted-foreground">
                            {i + 1}.
                          </span>
                          {msg}
                        </li>
                      ))
                    ) : (
                      <li className="text-muted-foreground">
                        Không có mục nào.
                      </li>
                    )}
                  </ol>
                </ScrollArea>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium text-foreground/80">
                  Tiến độ theo giai đoạn (update_status)
                </p>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {updateEntries.map(({ key, label, progress }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between gap-2 rounded-md border border-emerald-100/70 bg-emerald-50/25 px-2 py-1.5 text-xs dark:border-emerald-900/30 dark:bg-emerald-950/15"
                    >
                      <span className="truncate text-muted-foreground">
                        {label}
                      </span>
                      <span className="shrink-0 font-mono text-emerald-800 dark:text-emerald-200">
                        {progress}
                      </span>
                    </div>
                  ))}
                </div>
                {updateEntries.length > 0 && (
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    Số dạng x/y: số bước đã xong / tổng số bước trong mảng
                    boolean.
                  </p>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Alert>
  );
}
