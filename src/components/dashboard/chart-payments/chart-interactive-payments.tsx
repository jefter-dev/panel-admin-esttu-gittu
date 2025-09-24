"use client";

import * as React from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePaymentsByPeriod } from "@/hooks/dashboard/use-payments-by-period";
import { DateRangePicker } from "@/components/date-range-picker";
import { ChartTypeSelector } from "@/components/dashboard/chart-payments/chart-type-selector";
import { PaymentsChart } from "@/components/dashboard/chart-payments/payments-chart";
import { DateTimeRangeSelector } from "@/components/date-time-range-selector";

export type PaymentChartItem = {
  date: string;
  total: number;
};

export type TimeRange = "1y" | "6m" | "3m" | "30d" | "7d" | "1d";
export type ChartType = "area" | "bar";

export function ChartInteractivePayments() {
  const [timeRange, setTimeRange] = React.useState<TimeRange | null>("7d");
  const [chartType, setChartType] = React.useState<ChartType>("bar");
  const [currentDateRange, setCurrentDateRange] = React.useState<{
    from: Date;
    to: Date;
  } | null>(null);

  const { payments, isLoading } = usePaymentsByPeriod(
    timeRange,
    currentDateRange
  );

  return (
    <Card className="@container/cardblock">
      <CardHeader className="block sm:grid">
        <CardTitle>Pagamentos</CardTitle>
        <CardDescription>
          Total registrado no período selecionado
        </CardDescription>

        <CardAction className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full sm:justify-end">
          <DateTimeRangeSelector
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            setCurrentDateRange={setCurrentDateRange}
          />

          <DateRangePicker
            date={currentDateRange ?? undefined}
            onChange={(range) => {
              if (range?.from && range?.to) {
                setCurrentDateRange({ from: range.from, to: range.to });
                setTimeRange(null);
              } else {
                setCurrentDateRange(null);
              }
            }}
          />

          <ChartTypeSelector
            chartType={chartType}
            setChartType={setChartType}
          />
        </CardAction>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <PaymentsChart
          payments={payments}
          chartType={chartType}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}
