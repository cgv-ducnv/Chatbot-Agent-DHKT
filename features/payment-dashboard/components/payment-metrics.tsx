"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { StatOverview } from "@/services/stats/service";
import {
  ArrowUpRight,
  Calendar,
  MessageCircle,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { convertDateTime } from "@/utils/convert-time";

interface PaymentMetricsProps {
  timeRange: StatOverview["timeRange"];
  sockets: StatOverview["sockets"];
  chatContacts: StatOverview["chatContacts"];
}

export function PaymentMetrics({
  timeRange,
  sockets,
  chatContacts,
}: PaymentMetricsProps) {
  const start = convertDateTime(timeRange.startUtc, "short");
  const end = convertDateTime(timeRange.endUtc, "short");

  const metrics = [
    {
      title: "Số lượng người dùng đang hoạt động",
      current: sockets.activeSessions.toString(),
      previous: "—",
      growth: 0,
      icon: Users,
      isTimeRange: false,
    },
    {
      title: "Số lượng người dùng trong hệ thống",
      current: chatContacts.totalInSystem.toString(),
      previous: "—",
      growth: 0,
      icon: MessageCircle,
      isTimeRange: false,
    },
    {
      title: "Khoảng thời gian thống kê",
      current: `${start.date} - ${end.date}`,
      previous: "—",
      growth: 0,
      icon: Calendar,
      isTimeRange: true,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 @5xl:grid-cols-3">
      {metrics.map((metric, index) => {
        const isTimeRange = metric.isTimeRange;

        return (
          <Card key={index} className="border">
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <metric.icon className="size-6 text-muted-foreground" />
                {!isTimeRange && (
                  <Badge
                    variant="outline"
                    className={cn(
                      metric.growth >= 0
                        ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400"
                        : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400",
                    )}
                  >
                    {metric.growth >= 0 ? (
                      <>
                        <TrendingUp className="me-1 size-3" />+{metric.growth}%
                      </>
                    ) : (
                      <>
                        <TrendingDown className="me-1 size-3" />
                        {metric.growth}%
                      </>
                    )}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </p>
                {isTimeRange ? (
                  <div className="inline-flex max-w-full items-center gap-1 rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                    <span className="truncate">{metric.current}</span>
                  </div>
                ) : (
                  <div className="text-2xl font-bold">{metric.current}</div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
