"use client";

import { useState } from "react";
import { ChartAreaInteractive } from "@/features/dashboard/components/chart-area-interactive";
import { DataTable } from "@/features/dashboard/components/data-table";
// import { SectionCards } from "@/features/dashboard/components/selection-cards";
import data from "@/constants/data.json";
import focusDocumentsData from "@/constants/format-documents-data.json";
import keyPersonnelData from "@/constants/key-personal-data.json";
import pastPerformanceData from "@/constants/past-performance-data.json";
// import { DashboardStatsCards } from "@/features/dashboard/components/dashboard-stats-cards";
import { PaymentMetrics } from "@/features/payment-dashboard/components/payment-metrics";
// import { QuickActions } from "@/features/dashboard2/components/quick-actions";
import { PaymentVolumeChart } from "@/features/payment-dashboard/components/payment-volume-chart";
import { PaymentMethodsBreakdown } from "@/features/payment-dashboard/components/payment-methods-breakdown";
// import { RecentPayments } from "@/features/payment-dashboard/components/recent-payments";
// import { PaymentGatewayStatus } from "@/features/payment-dashboard/components/payment-gateway-status";
import { PaymentAnalytics } from "@/features/payment-dashboard/components/payment-analytics";
import { useStatOverview } from "@/hooks/stats/use-stats";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Page() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  const { data: statOverview } = useStatOverview({
    year: selectedYear,
    month: selectedMonth,
  });

  const years = [
    now.getFullYear() - 1,
    now.getFullYear(),
    now.getFullYear() + 1,
  ];

  return (
    <>
      <div className="px-4 lg:px-6 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Trang chủ</h1>
          <div className="flex items-center gap-2">
            <Select
              value={String(selectedMonth)}
              onValueChange={(value) => setSelectedMonth(Number(value))}
            >
              <SelectTrigger className="w-[120px]">
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
              <SelectTrigger className="w-[120px]">
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

      <div className="@container/main px-4 lg:px-6 space-y-6">
        {/* <DashboardStatsCards /> */}
        {statOverview && (
          <PaymentMetrics
            timeRange={statOverview.timeRange}
            sockets={statOverview.sockets}
            chatContacts={statOverview.chatContacts}
          />
        )}
        <div className="grid gap-6 @5xl:grid-cols-2 min-w-0">
          {/* <ChartAreaInteractive /> */}
          {statOverview && (
            <PaymentMethodsBreakdown
              conversations={statOverview.conversations}
            />
          )}
          {statOverview && (
            <PaymentMethodsBreakdown messages={statOverview.messages} />
          )}
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
