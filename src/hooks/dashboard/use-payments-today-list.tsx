// hooks/dashboard/use-payments-today-list.ts
"use client";

import { apiClient } from "@/lib/http-client";
import { Payment } from "@/types/payment.type";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function usePaymentsTodayList() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get<{ payments: Payment[] }>(
          "/payments/today"
        );
        setPayments(res.data.payments);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao buscar pagamentos de hoje");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  return { payments, isLoading };
}
