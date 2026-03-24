"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useDocumentStatusCounts } from "@/hooks/documents/use-documents";
import {
  ArrowUpRight,
  FileStack,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";

const LABELS: Record<string, string> = {
  PENDING: "Chờ xử lý",
  PROCESSING: "Đang xử lý",
  PROCESSED: "Đã xử lý",
  FAILED: "Lỗi",
  COMPLETED: "Hoàn tất",
};

const ICONS: Record<string, typeof FileStack> = {
  PENDING: Clock,
  PROCESSING: Loader2,
  PROCESSED: CheckCircle2,
  FAILED: AlertCircle,
  COMPLETED: CheckCircle2,
};

export function DocumentStateCards() {
  const { data, isLoading, isError } = useDocumentStatusCounts();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border animate-pulse">
            <CardContent className="h-28 bg-muted/40" />
          </Card>
        ))}
      </div>
    );
  }

  if (isError || data == null || typeof data !== "object") {
    return (
      <Card className="border border-dashed">
        <CardContent className="py-6 text-sm text-muted-foreground">
          Không tải được thống kê trạng thái tài liệu.
        </CardContent>
      </Card>
    );
  }

  const entries = Object.entries(data as Record<string, number>).filter(
    ([, v]) => typeof v === "number",
  );

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {entries.map(([key, value]) => {
        const Icon = ICONS[key] ?? FileStack;
        const label = LABELS[key] ?? key;
        return (
          <Card key={key} className="border">
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Icon className="text-muted-foreground size-6" />
                <Badge variant="outline" className="font-mono tabular-nums">
                  {value.toLocaleString()}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium">
                  {label}
                </p>
                <div className="text-2xl font-bold tabular-nums">
                  {value.toLocaleString()}
                </div>
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <span className="uppercase text-xs tracking-wide opacity-70">
                    {key}
                  </span>
                  <ArrowUpRight className="size-3 opacity-50" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
