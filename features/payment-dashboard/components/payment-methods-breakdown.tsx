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
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { StatOverview } from "@/services/stats/service";
// import { useState } from "react";
import { Cell, Pie, PieChart } from "recharts";
import { toast } from "sonner";
import { EmptyData } from "@/components/empty-data";
import { useEffect, useRef } from "react";

const RADIAN = Math.PI / 180;

interface PaymentMethodsBreakdownProps {
  messages?: StatOverview["messages"];
  conversations?: StatOverview["conversations"];
}

export function PaymentMethodsBreakdown({
  messages,
  conversations,
}: PaymentMethodsBreakdownProps) {
  // const [period, setPeriod] = useState("month");
  const isMobile = useIsMobile();

  const isMessagesMode = !!messages;

  const chartConfig = {
    value: { label: "Tỉ lệ" },
    ai: {
      label: isMessagesMode
        ? "Tin nhắn AI"
        : "Cuộc hội thoại AI đang hoạt động",
      // Xanh dương đậm cho AI / hội thoại active
      color: "hsl(217 91% 60%)",
    },
    staff: {
      label: isMessagesMode
        ? "Tin nhắn nhân viên"
        : "Cuộc hội thoại nhân viên trực",
      // Xanh lá cho nhân viên hoặc hội thoại còn lại
      color: "hsl(142 76% 36%)",
    },
    user: {
      label: "Tin nhắn khách",
      // Màu vàng chỉ dùng cho messages
      color: "hsl(48 96% 53%)",
    },
  };

  let paymentMethodsData:
    | {
        name: string;
        value: number;
        amount: number;
        color: string;
      }[]
    | undefined;
  let totalAmount = 0;
  let totalForEmptyState = 0;

  if (isMessagesMode && messages) {
    const total =
      messages.totalInRange ||
      messages.aiMessages + messages.staffMessages + messages.userMessages;

    totalForEmptyState = total;

    paymentMethodsData = [
      {
        name: "AI",
        value: total ? (messages.aiMessages / total) * 100 : 0,
        amount: messages.aiMessages,
        color: chartConfig.ai.color as string,
      },
      {
        name: "Nhân viên",
        value: total ? (messages.staffMessages / total) * 100 : 0,
        amount: messages.staffMessages,
        color: chartConfig.staff.color as string,
      },
      {
        name: "Khách hàng",
        value: total ? (messages.userMessages / total) * 100 : 0,
        amount: messages.userMessages,
        color: chartConfig.user.color as string,
      },
    ];
  } else if (conversations) {
    const total =
      conversations.totalInRange ||
      conversations.aiActive + conversations.aiInactive;

    totalForEmptyState = total;

    paymentMethodsData = [
      {
        name: "AI đang hoạt động",
        value: total ? (conversations.aiActive / total) * 100 : 0,
        amount: conversations.aiActive,
        color: chartConfig.ai.color as string,
      },
      {
        name: "Nhân viên trực",
        value: total ? (conversations.aiInactive / total) * 100 : 0,
        amount: conversations.aiInactive,
        color: chartConfig.staff.color as string,
      },
    ];
  }

  if (paymentMethodsData) {
    totalAmount = paymentMethodsData.reduce(
      (acc, item) => acc + item.amount,
      0,
    );
  }

  const isEmptyState = totalForEmptyState === 0 || totalAmount === 0;

  const didToastRef = useRef(false);
  useEffect(() => {
    if (!paymentMethodsData) return;
    if (!isEmptyState) {
      didToastRef.current = false;
      return;
    }

    if (!didToastRef.current) {
      toast.warning("Không tìm thấy dữ liệu. Chọn mốc thời gian khác");
      didToastRef.current = true;
    }
  }, [isEmptyState, paymentMethodsData]);

  if (isEmptyState && paymentMethodsData) {
    return (
      <Card className="group h-full border-border/60 bg-background/80 backdrop-blur-sm shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md overflow-hidden min-w-0">
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-radial from-emerald-500/10 via-transparent to-transparent" />
        <CardHeader className="relative flex flex-col space-y-4 pb-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <CardTitle>
              {isMessagesMode
                ? "Phân bổ loại tin nhắn"
                : "Phân bổ cuộc hội thoại"}
            </CardTitle>
            <CardDescription>
              Không tìm thấy dữ liệu. Chọn mốc thời gian khác
            </CardDescription>
          </div>
          <Badge variant="outline" className="rounded-full font-mono tabular-nums">
            0
          </Badge>
        </CardHeader>
        <CardContent className="relative">
          <EmptyData
            icon={AlertCircle}
            title="Không tìm thấy dữ liệu"
            description="Không tìm thấy dữ liệu. Chọn mốc thời gian khác"
            className="bg-background/40"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group relative h-full border-border/60 bg-background/80 backdrop-blur-sm shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md overflow-hidden min-w-0">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-radial from-emerald-500/10 via-transparent to-transparent" />
      <CardHeader className="relative flex flex-col space-y-4 pb-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <CardTitle>
            {isMessagesMode
              ? "Phân bổ loại tin nhắn"
              : "Phân bổ cuộc hội thoại"}
          </CardTitle>
          <CardDescription>
            {isMessagesMode
              ? "Tỷ lệ tin nhắn theo AI / nhân viên / khách"
              : "Tỷ lệ cuộc hội thoại AI đang hoạt động / không hoạt động"}
          </CardDescription>
        </div>
        {/* <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-full cursor-pointer sm:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week" className="cursor-pointer">
              Tuần này
            </SelectItem>
            <SelectItem value="month" className="cursor-pointer">
              Tháng này
            </SelectItem>
            <SelectItem value="year" className="cursor-pointer">
              Năm nay
            </SelectItem>
          </SelectContent>
        </Select> */}
      </CardHeader>
      <CardContent>
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-center justify-center sm:flex-1">
            <div className="relative shrink-0">
              <ChartContainer
                config={chartConfig}
                className="h-[150px] w-[150px] sm:h-[190px] sm:w-[190px] mx-auto"
              >
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent formatter={(value) => `${value}%`} />
                    }
                  />
                  <Pie
                    data={paymentMethodsData ?? []}
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
                    {paymentMethodsData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              {/* subtle ring */}
              <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-border/50" />
            </div>
          </div>
          <div className="grid min-w-0 grid-cols-1 gap-2 sm:flex sm:flex-1 sm:flex-col">
            {paymentMethodsData?.map((method, index) => (
              <div
                key={index}
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
