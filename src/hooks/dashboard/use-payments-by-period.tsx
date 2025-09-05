"use client";

import {
  PaymentChartItem,
  TimeRange,
} from "@/components/dashboard/chart-payments/chart-interactive-payments";
import { apiClient } from "@/lib/http-client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const TIME_RANGE_TO_DAYS: Record<TimeRange, number> = {
  "1d": 1,
  "7d": 7,
  "30d": 30,
  "3m": 90,
  "6m": 180,
  "1y": 365,
};

export function usePaymentsByPeriod(
  timeRange: TimeRange | null,
  customRange?: { from: Date; to: Date } | null
) {
  const [payments, setPayments] = useState<PaymentChartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let dateFrom: Date;
        let dateTo: Date;

        if (customRange) {
          dateFrom = customRange.from;
          dateTo = customRange.to;
        } else if (timeRange) {
          const now = new Date();
          if (timeRange === "1d") {
            dateFrom = new Date(now);
            dateFrom.setHours(0, 0, 0, 0);
            dateTo = new Date(now);
            dateTo.setHours(23, 59, 59, 999);
          } else {
            dateTo = now;
            dateFrom = new Date(now);
            dateFrom.setDate(now.getDate() - TIME_RANGE_TO_DAYS[timeRange]);
          }
        } else {
          const now = new Date();
          dateFrom = new Date(now);
          dateFrom.setHours(0, 0, 0, 0);
          dateTo = new Date(now);
          dateTo.setHours(23, 59, 59, 999);
        }

        const res = await apiClient.get<{
          stats: { payments: PaymentChartItem[] };
        }>("/payments/stats/period", {
          params: {
            dateFrom: dateFrom.toISOString(),
            dateTo: dateTo.toISOString(),
          },
        });

        setPayments(res.data.stats.payments || []);
      } catch (err) {
        toast.error(
          `Erro ao buscar pagamentos: ${
            err instanceof Error ? err.message : "Erro desconhecido"
          }`
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange, customRange]);

  return { payments, isLoading };
}
