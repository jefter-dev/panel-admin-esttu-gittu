"use client";

import { useState, useEffect } from "react";
import axios, { isAxiosError } from "axios";
import { toast } from "sonner";
import { SessionAdapter } from "@/lib/session-adapter";
import { SessionPayload } from "@/types/sessions";
import { Admin } from "@/types/admin"; // 1. Importe o tipo Admin

export function useAdminDetails(session: SessionPayload | null) {
  // 2. O estado agora armazena um 'Admin'
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
        const accessToken = await SessionAdapter.getAccessToken();

        if (!accessToken) {
          toast.error("Sessão inválida. Por favor, faça login novamente.");
          setIsLoading(false);
          return;
        }

        // 3. A URL da API agora aponta para o endpoint de administradores
        const response = await axios.get<Admin>(`/api/admins/${session.id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

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

  // 4. Retorna os detalhes do admin
  return { adminDetails, isLoading };
}
