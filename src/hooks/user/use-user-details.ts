"use client";

import { useState, useEffect } from "react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { User } from "@/types/user.type";
import { apiClient } from "@/lib/http-client";

export function useUserDetails(userId: string | null | undefined) {
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Começa como true para o estado inicial

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchUserDetails = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get<User>(`/users/${userId}`);
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
        setUserDetails(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  return { userDetails, isLoading };
}
