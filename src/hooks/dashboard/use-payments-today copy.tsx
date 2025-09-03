"use client";
import { apiClient } from "@/lib/http-client";
import { PaymentsStats } from "@/types/payment.type";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function usePaymentsToday() {
  const [stats, setStats] = useState<PaymentsStats>({
    count: 0,
    totalAmount: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get<{ stats: PaymentsStats }>(
          "/payments/stats/today"
        );
        setStats(res.data.stats);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao buscar pagamentos de hoje");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { stats, isLoading };
}
