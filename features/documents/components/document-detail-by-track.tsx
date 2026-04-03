"use client";

import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { DocumentItem } from "@/services/documents/services";
import { cn } from "@/lib/utils";
import { EmptyData } from "@/components/empty-data";
import { IconMoodEmpty } from "@tabler/icons-react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export type TrackStatusSummary = {
  processed?: number;
  processing?: number;
  failed?: number;
  [key: string]: number | undefined;
};

export type TrackStatusResponse = {
  track_id: string;
  documents: DocumentItem[];
  total_count: number;
  status_summary: TrackStatusSummary;
};

interface DocumentDetailByTrackProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trackId: string | null;
  trackStatus: TrackStatusResponse | null;
  isLoading?: boolean;
  isFetching?: boolean;
}

/** Dịch khóa status_summary (API thường trả tiếng Anh) */
const STATUS_SUMMARY_KEY_VI: Record<string, string> = {
  processed: "Đã xử lý",
  processing: "Đang xử lý",
  failed: "Thất bại / lỗi",
  pending: "Chờ xử lý",
  preprocessed: "Tiền xử lý",
};

function statusSummaryLabelVi(key: string): string {
  return STATUS_SUMMARY_KEY_VI[key] ?? key;
}

function statusBadgeClass(status: string) {
  const s = status?.toLowerCase() ?? "";
  if (s === "processed") {
    return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
  }
  if (s === "processing") {
    return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
  }
  if (s === "failed") {
    return "bg-red-500/15 text-red-700 dark:text-red-400";
  }
  return "bg-muted text-muted-foreground";
}

function formatIso(iso: string | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("vi-VN");
  } catch {
    return iso;
  }
}

function formatUnixTimestamp(seconds: number | null | undefined) {
  if (seconds == null || Number.isNaN(seconds)) return "—";
  try {
    return new Date(seconds * 1000).toLocaleString("vi-VN");
  } catch {
    return String(seconds);
  }
}

type FieldAccent =
  | "sky"
  | "violet"
  | "amber"
  | "emerald"
  | "cyan"
  | "indigo"
  | "slate"
  | "rose"
  | "fuchsia";

const ACCENT_ROW: Record<FieldAccent, string> = {
  sky: "border-l-4 border-sky-400/45 bg-sky-50/50 dark:border-sky-500/35 dark:bg-sky-950/30",
  violet:
    "border-l-4 border-violet-400/45 bg-violet-50/45 dark:border-violet-500/35 dark:bg-violet-950/25",
  amber:
    "border-l-4 border-amber-400/45 bg-amber-50/40 dark:border-amber-500/35 dark:bg-amber-950/25",
  emerald:
    "border-l-4 border-emerald-400/45 bg-emerald-50/40 dark:border-emerald-500/35 dark:bg-emerald-950/25",
  cyan: "border-l-4 border-cyan-400/45 bg-cyan-50/35 dark:border-cyan-500/35 dark:bg-cyan-950/25",
  indigo:
    "border-l-4 border-indigo-400/45 bg-indigo-50/40 dark:border-indigo-500/35 dark:bg-indigo-950/25",
  slate:
    "border-l-4 border-slate-400/40 bg-slate-50/50 dark:border-slate-500/30 dark:bg-slate-900/25",
  rose: "border-l-4 border-rose-400/45 bg-rose-50/40 dark:border-rose-500/35 dark:bg-rose-950/25",
  fuchsia:
    "border-l-4 border-fuchsia-400/40 bg-fuchsia-50/35 dark:border-fuchsia-500/30 dark:bg-fuchsia-950/20",
};

function FieldRow({
  label,
  children,
  accent = "slate",
}: {
  label: string;
  children: ReactNode;
  accent?: FieldAccent;
}) {
  return (
    <div
      className={cn(
        "grid gap-1 rounded-lg py-3 pl-3 sm:grid-cols-[minmax(160px,220px)_1fr] sm:gap-4 sm:pl-4",
        ACCENT_ROW[accent],
      )}
    >
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-sm text-foreground">{children}</dd>
    </div>
  );
}

const CARD_SKINS = [
  "border-emerald-200/50 bg-linear-to-br from-white via-emerald-50/30 to-sky-50/40 dark:from-card dark:via-emerald-950/20 dark:to-sky-950/15",
  "border-violet-200/50 bg-linear-to-br from-white via-violet-50/30 to-amber-50/30 dark:from-card dark:via-violet-950/20 dark:to-amber-950/10",
  "border-sky-200/50 bg-linear-to-br from-white via-sky-50/35 to-rose-50/25 dark:from-card dark:via-sky-950/20 dark:to-rose-950/10",
] as const;

export function DocumentDetailByTrack({
  open,
  onOpenChange,
  trackId,
  trackStatus,
  isLoading,
  isFetching,
}: DocumentDetailByTrackProps) {
  const effectiveTrackId = trackStatus?.track_id ?? trackId ?? "—";
  const documents = trackStatus?.documents ?? [];
  const totalCount = trackStatus?.total_count ?? 0;
  const statusSummary = trackStatus?.status_summary;

  const summaryEntries =
    statusSummary && typeof statusSummary === "object"
      ? Object.entries(statusSummary).filter(
          ([, v]) => v !== undefined && v !== null,
        )
      : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-6xl flex-col gap-0 overflow-hidden border-sky-200/40 bg-linear-to-b from-sky-50/30 to-background p-0 dark:border-sky-900/30 dark:from-sky-950/20 sm:max-w-6xl">
        <div className="shrink-0 border-b border-violet-200/30 bg-linear-to-r from-violet-50/50 via-background to-sky-50/40 px-6 pb-4 pt-6 dark:border-violet-900/25 dark:from-violet-950/25 dark:via-background dark:to-sky-950/20">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-violet-950 dark:text-violet-100">
              Chi tiết theo mã track
            </DialogTitle>
            <DialogDescription>
              Đầy đủ thông tin theo track — hiển thị tiếng Việt, màu phân vùng
              nhẹ.
            </DialogDescription>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-medium text-violet-700/80 dark:text-violet-300/90">
                Mã track
              </span>
              <code className="break-all rounded-md border border-sky-200/60 bg-sky-50/80 px-2 py-1 text-xs text-sky-950 dark:border-sky-800/50 dark:bg-sky-950/40 dark:text-sky-100">
                {effectiveTrackId}
              </code>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-violet-600 hover:bg-violet-100/80 dark:text-violet-400 dark:hover:bg-violet-950/50"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(effectiveTrackId);
                    toast.success("Đã copy mã track");
                  } catch {
                    toast.error("Không thể copy mã track");
                  }
                }}
                aria-label="Sao chép mã track"
              >
                <Copy className="size-4" />
              </Button>
            </div>
          </DialogHeader>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {isLoading || isFetching ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : documents.length === 0 ? (
            <EmptyData
              icon={IconMoodEmpty}
              title="Chưa có dữ liệu."
              description="Không tìm thấy dữ liệu cho mã track này."
              showButton={false}
              buttonText=""
              onButtonClick={() => {}}
            />
          ) : (
            <div className="space-y-8">
              <section
                className={cn(
                  "space-y-3 rounded-xl via-background to-violet-50/40 p-4 dark:border-cyan-900/30 dark:from-cyan-950/20 dark:via-background dark:to-violet-950/20",
                )}
              >
                <h3 className="text-sm font-semibold text-cyan-900 dark:text-cyan-100">
                  Tổng quan theo track
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge className="border-cyan-200/70 bg-cyan-100/70 font-normal text-cyan-900 dark:border-cyan-800/50 dark:bg-cyan-950/50 dark:text-cyan-100">
                    Tổng bản ghi: {totalCount}
                  </Badge>
                  {summaryEntries.map(([key, value]) => (
                    <Badge
                      key={key}
                      variant="outline"
                      className={cn(
                        "font-normal",
                        statusBadgeClass(
                          key === "processed"
                            ? "processed"
                            : key === "processing"
                              ? "processing"
                              : key === "failed"
                                ? "failed"
                                : "other",
                        ),
                      )}
                    >
                      {statusSummaryLabelVi(key)}: {String(value)}
                    </Badge>
                  ))}
                </div>
                {statusSummary && (
                  <pre className="max-h-48 overflow-auto rounded-lg border border-violet-200/50 bg-violet-50/40 p-3 text-xs leading-relaxed text-violet-950 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-100">
                    {JSON.stringify(statusSummary, null, 2)}
                  </pre>
                )}
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                  Danh sách tài liệu ({documents.length})
                </h3>
                {documents.map((doc, index) => (
                  <article
                    key={doc.id}
                    className={cn(
                      "rounded-xl p-4 shadow-sm",
                      CARD_SKINS[index % CARD_SKINS.length],
                    )}
                  >
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
                      <span className="text-xs font-medium text-muted-foreground">
                        Bản ghi {index + 1}
                      </span>
                      <Badge
                        variant="secondary"
                        className={statusBadgeClass(doc.status)}
                      >
                        {doc.status}
                      </Badge>
                    </div>
                    <dl className="space-y-2">
                      <FieldRow label="Mã tài liệu (id)" accent="violet">
                        <code className="break-all text-xs">{doc.id}</code>
                      </FieldRow>
                      <FieldRow label="Mã track" accent="sky">
                        <code className="break-all text-xs">
                          {doc.track_id || "—"}
                        </code>
                      </FieldRow>
                      <FieldRow label="Trạng thái xử lý" accent="amber">
                        {doc.status}
                      </FieldRow>
                      <FieldRow
                        label="Độ dài nội dung (ký tự)"
                        accent="emerald"
                      >
                        <span className="tabular-nums">
                          {doc.content_length}
                        </span>
                      </FieldRow>
                      <FieldRow label="Số khối (chunks)" accent="cyan">
                        <span className="tabular-nums">{doc.chunks_count}</span>
                      </FieldRow>
                      <FieldRow label="Thời điểm tạo" accent="indigo">
                        {formatIso(doc.created_at)}
                      </FieldRow>
                      <FieldRow label="Cập nhật lần cuối" accent="sky">
                        {formatIso(doc.updated_at)}
                      </FieldRow>
                      <FieldRow label="Đường dẫn tệp" accent="slate">
                        <span className="whitespace-pre-wrap wrap-break-word">
                          {doc.file_path || "—"}
                        </span>
                      </FieldRow>
                      <FieldRow label="Tóm tắt nội dung" accent="fuchsia">
                        <div className="whitespace-pre-wrap wrap-break-word">
                          {doc.content_summary || "—"}
                        </div>
                      </FieldRow>
                      <FieldRow label="Thông báo lỗi" accent="rose">
                        <div className="whitespace-pre-wrap wrap-break-word text-destructive">
                          {doc.error_msg ?? "—"}
                        </div>
                      </FieldRow>
                      <FieldRow label="Siêu dữ liệu (metadata)" accent="violet">
                        <div className="space-y-3">
                          {/* Summary Card */}
                          <div className="rounded-xl border border-violet-200/40 bg-violet-50/60 dark:border-violet-900/40 dark:bg-violet-950/30">
                            <div className="flex items-center justify-between border-b border-violet-200/40 px-3 py-2 dark:border-violet-900/40">
                              <span className="text-sm font-semibold text-violet-900 dark:text-violet-100">
                                Thông tin xử lý
                              </span>

                              {doc.metadata?.processing_end_time ? (
                                <span className="rounded-md bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">
                                  Hoàn thành
                                </span>
                              ) : (
                                <span className="rounded-md bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-600">
                                  Đang xử lý
                                </span>
                              )}
                            </div>

                            <div className="grid gap-2 p-3 text-sm">
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                  Bắt đầu xử lý
                                </span>
                                <span className="font-medium">
                                  {formatUnixTimestamp(
                                    doc.metadata?.processing_start_time,
                                  )}
                                </span>
                              </div>

                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                  Kết thúc xử lý
                                </span>
                                <span className="font-medium">
                                  {formatUnixTimestamp(
                                    doc.metadata?.processing_end_time,
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* JSON Toggle */}
                          <details className="group rounded-lg border border-violet-200/40 bg-violet-50/30 dark:border-violet-900/40 dark:bg-violet-950/30">
                            <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium text-violet-800 dark:text-violet-200">
                              Xem dữ liệu thô (JSON)
                            </summary>

                            <pre className="max-h-64 overflow-auto border-t border-violet-200/40 p-3 text-xs dark:border-violet-900/40">
                              {JSON.stringify(doc.metadata ?? {}, null, 2)}
                            </pre>
                          </details>
                        </div>
                      </FieldRow>
                    </dl>
                  </article>
                ))}
              </section>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
