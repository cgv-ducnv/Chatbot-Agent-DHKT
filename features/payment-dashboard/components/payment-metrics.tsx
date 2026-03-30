"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { StatOverview } from "@/services/stats/service";
import { Calendar, MessageCircle, Users } from "lucide-react";
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

  const activeSessions = sockets.activeSessions ?? 0;
  const totalUsers = chatContacts.totalInSystem ?? 0;
  return (
    <div className="grid gap-6 sm:grid-cols-2 @5xl:grid-cols-3">
      {/* Active Sessions */}
      <Card className="group border border-emerald-200 hover:border-emerald-300 dark:border-emerald-800 dark:hover:border-emerald-700 bg-white dark:bg-zinc-950 transition-all duration-300 hover:shadow-md">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div className="grid size-11 place-items-center rounded-xl bg-emerald-100 dark:bg-emerald-900/50">
              <Users className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <Badge
              variant="outline"
              className="text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700"
            >
              LIVE
            </Badge>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Người dùng đang hoạt động
            </p>
            <div className="mt-2 text-4xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-300 tabular-nums">
              {activeSessions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Phiên kết nối hiện tại
            </p>
          </div>

          <div className="h-1.5 w-full bg-emerald-100 dark:bg-emerald-950 rounded-full overflow-hidden">
            <div className="h-full w-full bg-emerald-500 rounded-full" />
          </div>
        </CardContent>
      </Card>

      {/* Total Users */}
      <Card className="group border border-violet-200 hover:border-violet-300 dark:border-violet-800 dark:hover:border-violet-700 bg-white dark:bg-zinc-950 transition-all duration-300 hover:shadow-md">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div className="grid size-11 place-items-center rounded-xl bg-violet-100 dark:bg-violet-900/50">
              <MessageCircle className="size-5 text-violet-600 dark:text-violet-400" />
            </div>
            <Badge
              variant="outline"
              className="text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-700"
            >
              TOTAL
            </Badge>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Người dùng trong hệ thống
            </p>
            <div className="mt-2 text-4xl font-semibold tracking-tight text-violet-700 dark:text-violet-300 tabular-nums">
              {totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tổng người dùng đã ghi nhận
            </p>
          </div>

          <div className="h-1.5 w-full bg-violet-100 dark:bg-violet-950 rounded-full overflow-hidden">
            <div className="h-full bg-violet-500 rounded-full" />
          </div>
        </CardContent>
      </Card>

      {/* Time Range */}
      <Card className="group border border-amber-200 hover:border-amber-300 dark:border-amber-800 dark:hover:border-amber-700 bg-white dark:bg-zinc-950 transition-all duration-300 hover:shadow-md">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div className="grid size-11 place-items-center rounded-xl bg-amber-100 dark:bg-amber-900/50">
              <Calendar className="size-5 text-amber-600 dark:text-amber-400" />
            </div>
            <Badge
              variant="outline"
              className="text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-700"
            >
              RANGE
            </Badge>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Khoảng thời gian thống kê
            </p>

            <div className="inline-flex w-full items-center justify-center rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/50 px-4 py-2.5 text-sm font-medium text-amber-700 dark:text-amber-300">
              {start.date} → {end.date}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/50 p-3 text-center">
                <div className="text-[10px] text-amber-600 dark:text-amber-400">
                  BẮT ĐẦU
                </div>
                <div className=" text-sm text-amber-700 dark:text-amber-300 tabular-nums">
                  {start.time}
                </div>
              </div>
              <div className="rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/50 p-3 text-center">
                <div className="text-[10px] text-amber-600 dark:text-amber-400">
                  KẾT THÚC
                </div>
                <div className=" text-sm text-amber-700 dark:text-amber-300 tabular-nums">
                  {end.time}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
