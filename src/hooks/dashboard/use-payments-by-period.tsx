"use client";
import { PaymentChartItem } from "@/components/dashboard/chart-interactive-payments";
import { apiClient } from "@/lib/http-client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function usePaymentsByPeriod(timeRange: "7d" | "30d" | "90d") {
  const [payments, setPayments] = useState<PaymentChartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const now = new Date();
        const dateTo = now.toISOString();

        const dateFrom = new Date(now);
        if (timeRange === "7d") dateFrom.setDate(now.getDate() - 7);
        if (timeRange === "30d") dateFrom.setDate(now.getDate() - 30);
        if (timeRange === "90d") dateFrom.setDate(now.getDate() - 90);

        const res = await apiClient.get<{
          stats: { payments: PaymentChartItem[] };
        }>("/payments/stats/period", {
          params: {
            dateFrom: dateFrom.toISOString(),
            dateTo,
          },
        });

        console.log("PAYMENTS GRAPH: ", res.data.stats);

        setPayments(res.data.stats.payments || []);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao buscar pagamentos");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  return { payments, isLoading };
}
