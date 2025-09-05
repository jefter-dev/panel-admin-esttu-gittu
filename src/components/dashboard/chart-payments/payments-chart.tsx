"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import {
  ChartType,
  PaymentChartItem,
} from "@/components/dashboard/chart-payments/chart-interactive-payments";

interface PaymentsChartProps {
  payments: PaymentChartItem[];
  chartType: ChartType;
  isLoading: boolean;
}

const chartConfig = {
  payments: {
    label: "Pagamentos",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function PaymentsChart({
  payments,
  chartType,
  isLoading,
}: PaymentsChartProps) {
  const normalizedPayments = React.useMemo(
    () =>
      payments.map((p) => ({
        ...p,
        date: new Date(p.date + "T00:00").toISOString(),
      })),
    [payments]
  );

  if (isLoading) return <p>Carregando...</p>;

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[250px] w-full"
    >
      {chartType === "area" ? (
        <AreaChart data={normalizedPayments}>
          <defs>
            <linearGradient id="fillPayments" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-payments)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-payments)"
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tickFormatter={(value) =>
              new Date(value).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              })
            }
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(value) =>
                  new Date(value).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                }
                indicator="dot"
              />
            }
          />
          <Area
            dataKey="total"
            type="natural"
            fill="url(#fillPayments)"
            stroke="var(--color-payments)"
            stackId="a"
          />
        </AreaChart>
      ) : (
        <BarChart data={normalizedPayments}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tickFormatter={(value) =>
              new Date(value).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              })
            }
          />
          <YAxis />
          <ChartTooltip
            cursor={{ fill: "rgba(0,0,0,0.05)" }}
            content={
              <ChartTooltipContent
                labelFormatter={(value) =>
                  new Date(value).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                }
                indicator="dot"
              />
            }
          />
          <Bar
            dataKey="total"
            fill="var(--color-payments)"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      )}
    </ChartContainer>
  );
}
