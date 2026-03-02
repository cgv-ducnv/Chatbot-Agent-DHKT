import { ChartAreaInteractive } from "@/features/dashboard/components/chart-area-interactive";
import { DataTable } from "@/features/dashboard/components/data-table";
import { SectionCards } from "@/features/dashboard/components/selection-cards";

import data from "@/constants/data.json";
import focusDocumentsData from "@/constants/format-documents-data.json";
import keyPersonnelData from "@/constants/key-personal-data.json";
import pastPerformanceData from "@/constants/past-performance-data.json";

import { DashboardStatsCards } from "@/features/dashboard/components/dashboard-stats-cards";
import { PaymentMetrics } from "@/features/payment-dashboard/components/payment-metrics";
import { QuickActions } from "@/features/dashboard2/components/quick-actions";
import { PaymentVolumeChart } from "@/features/payment-dashboard/components/payment-volume-chart";
import { PaymentMethodsBreakdown } from "@/features/payment-dashboard/components/payment-methods-breakdown";
import { RecentPayments } from "@/features/payment-dashboard/components/recent-payments";
import { PaymentGatewayStatus } from "@/features/payment-dashboard/components/payment-gateway-status";
import { PaymentAnalytics } from "@/features/payment-dashboard/components/payment-analytics";

export default function Page() {
  return (
    <>
      <div className="px-4 lg:px-6 py-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Trang chủ</h1>
          <p className="text-muted-foreground">
            Chào mừng đến với hệ thống quản lý trợ lý ảo tuyển sinh HAU AGENT
          </p>
        </div>
      </div>

      <div className="@container/main px-4 lg:px-6 space-y-6">
        {/* <DashboardStatsCards /> */}
        <PaymentMetrics />
        <div className="grid gap-6 @5xl:grid-cols-2 min-w-0">
          <ChartAreaInteractive />
          <PaymentMethodsBreakdown />
        </div>
      </div>
      <div className="grid gap-6 @5xl:grid-cols-2 min-w-0 lg:px-6">
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
      </div>
    </>
  );
}
