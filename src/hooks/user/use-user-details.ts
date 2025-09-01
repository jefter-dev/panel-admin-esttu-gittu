// Em: src/hooks/use-user-details.ts (ou onde o hook estiver)
"use client";

import { useState, useEffect } from "react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { User } from "@/types/user";
import { apiClient } from "@/lib/http-client";

// A assinatura agora aceita um ID de usuário (string), que pode ser nulo ou indefinido.
export function useUserDetails(userId: string | null | undefined) {
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Começa como true para o estado inicial

  useEffect(() => {
    // Se não houver ID, não fazemos nada.
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchUserDetails = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get<User>(`/users/${userId}`);
        console.log("response: ", response);
        setUserDetails(response.data);
      } catch (err) {
        console.error("Erro ao buscar detalhes do perfil do usuário:", err);
        if (isAxiosError(err)) {
          const errorMessage =
            err.response?.data?.error ||
            "Não foi possível carregar os detalhes do perfil.";
          toast.error(errorMessage);
        } else {
          toast.error("Ocorreu um erro inesperado.");
        }
        // Em caso de erro, limpamos os detalhes para evitar mostrar dados antigos.
        setUserDetails(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]); // O hook agora depende apenas do userId.

  return { userDetails, isLoading };
}
