"use client";
import { PaymentChartItem } from "@/components/dashboard/chart-area-interactive";
import { apiClient } from "@/lib/http-client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function usePaymentsCurrentMonth() {
  const [payments, setPayments] = useState<PaymentChartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get<{
          stats: { payments: PaymentChartItem[] };
        }>("/payments/stats/current-month");
        setPayments(res.data.stats.payments || []);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao buscar pagamentos do mês");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { payments, isLoading };
}
