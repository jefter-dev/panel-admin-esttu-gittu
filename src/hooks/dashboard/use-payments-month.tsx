"use client";
import { apiClient } from "@/lib/http-client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface PaymentsStats {
  count: number;
  totalAmount: number;
}

export function usePaymentsCurrentMonth() {
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
          "/payments/stats/month"
        );
        setStats(res.data.stats);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao buscar pagamentos do mês");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { stats, isLoading };
}
