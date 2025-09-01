"use client";

import { useState, useEffect } from "react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { SessionPayload } from "@/types/sessions";
import { Admin } from "@/types/admin";
import { apiClient } from "@/lib/http-client";

export function useAdminDetails(session: SessionPayload | null) {
  const [adminDetails, setAdminDetails] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!session?.id) {
      setIsLoading(false);
      return;
    }

    const fetchAdminDetails = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get<Admin>(`/admins/${session.id}`);
        setAdminDetails(response.data);
      } catch (err) {
        console.error("Erro ao buscar detalhes do admin:", err);
        if (isAxiosError(err)) {
          const errorMessage =
            err.response?.data?.error ||
            "Não foi possível carregar os dados do administrador.";
          toast.error(errorMessage);
        } else {
          toast.error("Ocorreu um erro inesperado.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminDetails();
  }, [session]);

  return { adminDetails, isLoading };
}
