"use client";

import { useState, useEffect } from "react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { apiClient } from "@/lib/http-client";

export function useUserStats() {
  const [stats, setStats] = useState<{
    paymentsConfirmed: number;
    totalUsers: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get<{
          stats: { paymentsConfirmed: number; totalUsers: number };
        }>("/users/stats");
        setStats(res.data.stats);
      } catch (err) {
        console.error(err);
        if (isAxiosError(err)) {
          toast.error("Erro ao buscar estatísticas de usuários");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { stats, isLoading };
}
