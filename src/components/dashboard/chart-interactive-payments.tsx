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
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { usePaymentsByPeriod } from "@/hooks/dashboard/use-payments-by-period";

export type PaymentChartItem = {
  date: string;
  total: number;
};

export type TimeRange = "7d" | "30d" | "90d";
export type ChartType = "area" | "bar";

const chartConfig = {
  payments: {
    label: "Pagamentos",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function ChartInteractivePayments() {
  const [timeRange, setTimeRange] = React.useState<TimeRange>("7d");
  const [chartType, setChartType] = React.useState<ChartType>("bar");

  const { payments, isLoading } = usePaymentsByPeriod(timeRange);

  const normalizedPayments = React.useMemo(
    () =>
      payments.map((p) => ({
        ...p,
        date: new Date(p.date + "T00:00").toISOString(),
      })),
    [payments]
  );

  return (
    <Card className="@container/cardblock">
      <CardHeader className="block sm:grid">
        <CardTitle>Pagamentos</CardTitle>
        <CardDescription>
          Total registrado no período selecionado
        </CardDescription>
        <CardAction className="flex gap-2">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(v: string) => {
              if (v) setTimeRange(v as TimeRange);
            }}
            variant="outline"
            className="hidden @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d" className="cursor-pointer">
              Últimos 3 meses
            </ToggleGroupItem>
            <ToggleGroupItem value="30d" className="cursor-pointer">
              Últimos 30 dias
            </ToggleGroupItem>
            <ToggleGroupItem value="7d" className="cursor-pointer">
              Últimos 7 dias
            </ToggleGroupItem>
          </ToggleGroup>

          <Select
            value={timeRange}
            onValueChange={(v: TimeRange) => setTimeRange(v)}
          >
            <SelectTrigger
              className="w-40 @[767px]/card:hidden cursor-pointer"
              size="sm"
            >
              <SelectValue placeholder="Selecione período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="90d">Últimos 3 meses</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={chartType}
            onValueChange={(v: ChartType) => setChartType(v)}
          >
            <SelectTrigger className="w-32 cursor-pointer" size="sm">
              <SelectValue placeholder="Tipo de gráfico" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="cursor-pointer" value="area">
                Área
              </SelectItem>
              <SelectItem className="cursor-pointer" value="bar">
                Barras
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <p>Carregando...</p>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
}
