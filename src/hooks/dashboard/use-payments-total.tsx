import { apiClient } from "@/lib/http-client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function usePaymentsTotal(dateFrom: string, dateTo: string) {
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!dateFrom || !dateTo) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get<{ stats: { total: number } }>(
          `/payments/stats/total?dateFrom=${dateFrom}&dateTo=${dateTo}`
        );
        setTotal(res.data.stats.total);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao buscar total de pagamentos no período");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateFrom, dateTo]);

  return { total, isLoading };
}
