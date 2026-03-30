"use client";

import { useState } from "react";
// import { ChartAreaInteractive } from "@/features/dashboard/components/chart-area-interactive";
// import { DataTable } from "@/features/dashboard/components/data-table";
// import { SectionCards } from "@/features/dashboard/components/selection-cards";
// import data from "@/constants/data.json";
// import focusDocumentsData from "@/constants/format-documents-data.json";
// import keyPersonnelData from "@/constants/key-personal-data.json";
// import pastPerformanceData from "@/constants/past-performance-data.json";
// import { DashboardStatsCards } from "@/features/dashboard/components/dashboard-stats-cards";
import { PaymentMetrics } from "@/features/payment-dashboard/components/payment-metrics";
// import { QuickActions } from "@/features/dashboard2/components/quick-actions";
// import { PaymentVolumeChart } from "@/features/payment-dashboard/components/payment-volume-chart";
import { PaymentMethodsBreakdown } from "@/features/payment-dashboard/components/payment-methods-breakdown";
import { DocumentStatusPieBreakdown } from "@/features/documents/components/document-status-pie-breakdown";
// import { RecentPayments } from "@/features/payment-dashboard/components/recent-payments";
// import { PaymentGatewayStatus } from "@/features/payment-dashboard/components/payment-gateway-status";
// import { PaymentAnalytics } from "@/features/payment-dashboard/components/payment-analytics";
import { useStatOverview } from "@/hooks/stats/use-stats";
import { useDocumentStatusCounts } from "@/hooks/documents/use-documents";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarRange, Dot } from "lucide-react";

export default function Page() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  const { data: statOverview } = useStatOverview({
    year: selectedYear,
    month: selectedMonth,
  });

  const { data: documentStatusCounts } = useDocumentStatusCounts();

  const years = [
    now.getFullYear() - 1,
    now.getFullYear(),
    now.getFullYear() + 1,
  ];

  return (
    <>
      {/* Header surface */}
      <div className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent" />
        <div className="absolute -top-24 -right-24 size-72 rounded-full bg-radial from-indigo-500/12 via-transparent to-transparent blur-xl" />
        <div className="relative px-4 lg:px-6 py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="relative flex items-center justify-center">
                  <span className="relative h-3 w-3 rounded-full bg-emerald-500"></span>
                </div>
                Tổng quan hoạt động hệ thống
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Dashboard
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-full">
                  <CalendarRange className="mr-2 size-3.5 opacity-70" />
                  {String(selectedMonth).padStart(2, "0")}/{selectedYear}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Thống kê tin nhắn / hội thoại theo mốc thời gian
                </span>
              </div>
            </div>

            {/* Time controls */}

            <div className="flex items-center gap-2">
              <Select
                value={String(selectedMonth)}
                onValueChange={(value) => setSelectedMonth(Number(value))}
              >
                <SelectTrigger className="h-9 w-[120px] rounded-full">
                  <SelectValue placeholder="Tháng" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <SelectItem key={month} value={String(month)}>
                      Tháng {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={String(selectedYear)}
                onValueChange={(value) => setSelectedYear(Number(value))}
              >
                <SelectTrigger className="h-9 w-[120px] rounded-full">
                  <SelectValue placeholder="Năm" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="@container/main px-4 py-6 space-y-6">
        {/* Metrics hero row */}
        {statOverview ? (
          <PaymentMetrics
            timeRange={statOverview.timeRange}
            sockets={statOverview.sockets}
            chatContacts={statOverview.chatContacts}
          />
        ) : (
          <Card className="border-border/50 overflow-hidden">
            <CardContent className="p-6">
              <div className="h-24 rounded-xl bg-muted/40 animate-pulse" />
            </CardContent>
          </Card>
        )}

        {/* Charts grid */}
        <div className="grid grid-cols-12 gap-6 min-w-0">
          <div className="col-span-12 xl:col-span-4 min-w-0">
            {statOverview ? (
              <PaymentMethodsBreakdown
                conversations={statOverview.conversations}
              />
            ) : (
              <Card className="h-full border-border/50 overflow-hidden">
                <CardContent className="p-6">
                  <div className="h-[260px] rounded-xl bg-muted/40 animate-pulse" />
                </CardContent>
              </Card>
            )}
          </div>

          <div className="col-span-12 xl:col-span-4 min-w-0">
            {statOverview ? (
              <PaymentMethodsBreakdown messages={statOverview.messages} />
            ) : (
              <Card className="h-full border-border/50 overflow-hidden">
                <CardContent className="p-6">
                  <div className="h-[260px] rounded-xl bg-muted/40 animate-pulse" />
                </CardContent>
              </Card>
            )}
          </div>

          <div className="col-span-12 xl:col-span-4 min-w-0">
            <DocumentStatusPieBreakdown
              statusCounts={documentStatusCounts?.status_counts}
            />
          </div>
        </div>
      </div>
      {/* <div className="grid gap-6 @5xl:grid-cols-2 min-w-0 lg:px-6">
        <PaymentVolumeChart />
      </div>
      <div className="grid gap-6 @5xl:grid-cols-2 min-w-0 lg:px-6">
        <PaymentAnalytics />
      </div>
      <div className="@container/main">
        <DataTable
          data={data}
          pastPerformanceData={pastPerformanceData}
          keyPersonnelData={keyPersonnelData}
          focusDocumentsData={focusDocumentsData}
        />
      </div> */}
    </>
  );
}
