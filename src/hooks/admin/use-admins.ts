"use client";

import { useState, useEffect } from "react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { SessionAdapter } from "@/lib/session-adapter";
import { Admin } from "@/types/admin";
import { apiClient } from "@/lib/http-client";

export function useAdmins() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAdmins = async () => {
      setIsLoading(true);
      try {
        const accessToken = await SessionAdapter.getAccessToken();
        if (!accessToken) {
          toast.error("Sessão inválida. Faça login novamente.");
          setIsLoading(false);
          return;
        }

        const response = await apiClient.get<Admin[]>("/admins");
        setAdmins(response.data);
      } catch (err) {
        console.error("Erro ao buscar admins:", err);
        if (isAxiosError(err)) {
          toast.error(
            err.response?.data?.error || "Não foi possível carregar os admins."
          );
        } else {
          toast.error("Ocorreu um erro inesperado.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  return { admins, isLoading };
}
