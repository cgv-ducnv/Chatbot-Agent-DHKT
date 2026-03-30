"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMemo } from "react";
import { Cell, Pie, PieChart } from "recharts";

import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { EmptyData } from "@/components/empty-data";

const RADIAN = Math.PI / 180;

type DocumentStatusKey =
  | "pending"
  | "processing"
  | "preprocessed"
  | "processed"
  | "failed";

type DocumentStatusCounts = Partial<Record<DocumentStatusKey, number>> & {
  all?: number;
};

export type DocumentStatusPieBreakdownProps = {
  statusCounts?: DocumentStatusCounts | null;
};

const STATUS_CONFIG: Record<
  DocumentStatusKey,
  { label: string; color: string }
> = {
  pending: { label: "Chờ xử lý", color: "hsl(48 96% 53%)" }, // amber/yellow
  processing: { label: "Đang xử lý", color: "hsl(217 91% 60%)" }, // blue
  preprocessed: { label: "Tiền xử lý", color: "hsl(259 89% 65%)" }, // purple
  processed: { label: "Đã xử lý", color: "hsl(142 76% 36%)" }, // green
  failed: { label: "Lỗi", color: "hsl(0 84% 60%)" }, // red
};

export function DocumentStatusPieBreakdown({
  statusCounts,
}: DocumentStatusPieBreakdownProps) {
  const isMobile = useIsMobile();

  const { slices, total } = useMemo(() => {
    const totalFromApi = statusCounts?.all;
    const totalFallback =
      (statusCounts?.pending ?? 0) +
      (statusCounts?.processing ?? 0) +
      (statusCounts?.preprocessed ?? 0) +
      (statusCounts?.processed ?? 0) +
      (statusCounts?.failed ?? 0);

    const computedTotal =
      typeof totalFromApi === "number" ? totalFromApi : totalFallback;

    // Luôn render đủ các trường trạng thái. Nếu thiếu dữ liệu -> amount=0 -> value=0%.
    const nextSlices = (Object.keys(STATUS_CONFIG) as DocumentStatusKey[]).map(
      (key) => {
        const amount = statusCounts?.[key] ?? 0;
        const value = computedTotal ? (amount / computedTotal) * 100 : 0;
        return {
          key,
          name: STATUS_CONFIG[key].label,
          amount,
          value,
          color: STATUS_CONFIG[key].color,
        };
      },
    );

    return { slices: nextSlices, total: computedTotal };
  }, [statusCounts]);

  const chartConfig: ChartConfig = useMemo(
    () => ({
      value: { label: "Tỉ lệ" },
      pending: {
        label: STATUS_CONFIG.pending.label,
        color: STATUS_CONFIG.pending.color,
      },
      processing: {
        label: STATUS_CONFIG.processing.label,
        color: STATUS_CONFIG.processing.color,
      },
      preprocessed: {
        label: STATUS_CONFIG.preprocessed.label,
        color: STATUS_CONFIG.preprocessed.color,
      },
      processed: {
        label: STATUS_CONFIG.processed.label,
        color: STATUS_CONFIG.processed.color,
      },
      failed: {
        label: STATUS_CONFIG.failed.label,
        color: STATUS_CONFIG.failed.color,
      },
    }),
    [],
  );

  const showTotalBadge = slices.length > 0 && total > 0;
  const isEmptyState = total === 0;

  return (
    <Card className="group relative h-full border-border/60 bg-background/80 backdrop-blur-sm shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md overflow-hidden min-w-0">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-radial from-indigo-500/10 via-transparent to-transparent" />
      <CardHeader className="relative flex flex-col space-y-4 pb-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <CardTitle>Phân bổ trạng thái tài liệu</CardTitle>
          <CardDescription>
            Tỷ lệ theo trạng thái xử lý tài liệu
          </CardDescription>
        </div>
        {showTotalBadge && (
          <Badge variant="outline" className="rounded-fulltabular-nums">
            Tổng {total.toLocaleString()}
          </Badge>
        )}
      </CardHeader>

      <CardContent>
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-center justify-center sm:flex-1">
            <div className="relative shrink-0">
              {isEmptyState ? (
                <EmptyData
                  icon={AlertCircle}
                  title="Không tìm thấy dữ liệu"
                  description="Tài liệu hiện chưa có thống kê trạng thái."
                  showButton={false}
                  className="h-[150px] w-[150px] sm:h-[190px] sm:w-[190px] mx-auto flex items-center justify-center bg-background/40"
                />
              ) : (
                <ChartContainer
                  config={chartConfig}
                  className="h-[150px] w-[150px] sm:h-[190px] sm:w-[190px] mx-auto"
                >
                  <PieChart>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => `${value}%`}
                        />
                      }
                    />
                    <Pie
                      data={slices}
                      cx="50%"
                      cy="50%"
                      innerRadius={isMobile ? 35 : 40}
                      outerRadius={isMobile ? 55 : 65}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      labelLine={false}
                      label={(props) => {
                        const {
                          cx,
                          cy,
                          midAngle,
                          innerRadius,
                          outerRadius,
                          payload,
                        } = props as {
                          cx: number;
                          cy: number;
                          midAngle: number;
                          innerRadius: number;
                          outerRadius: number;
                          payload: { amount?: number };
                        };

                        const amount = payload.amount;
                        if (!amount) return null;

                        const radius =
                          innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);

                        return (
                          <text
                            x={x}
                            y={y}
                            textAnchor="middle"
                            dominantBaseline="central"
                            className="fill-background text-[10px] font-semibold"
                            pointerEvents="none"
                          >
                            {amount.toLocaleString()}
                          </text>
                        );
                      }}
                    >
                      {slices.map((entry) => (
                        <Cell key={entry.key} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              )}
              {!isEmptyState && (
                <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-border/50" />
              )}
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-2 sm:flex sm:flex-1 sm:flex-col">
            {slices.map((method) => (
              <div
                key={method.key}
                className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-background/60 px-3 py-2 transition-colors hover:bg-background"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <div
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: method.color }}
                  />
                  <span className="truncate text-xs font-medium">
                    {method.name}
                  </span>
                </div>
                <div className="shrink-0 text-right space-y-0.5">
                  <div className="text-xs font-semibold tabular-nums">
                    {method.amount.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {method.value.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
