"use client";

import { useState, useEffect } from "react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { User } from "@/types/user";
import { SessionPayload } from "@/types/sessions"; // 1. Importe o tipo SessionPayload
import { apiClient } from "@/lib/http-client";

// A assinatura da função agora aceita 'SessionPayload | null'
export function useUserDetails(user: SessionPayload | null) {
  // O estado para os detalhes completos do perfil (tipo 'User')
  const [userDetails, setUserDetails] = useState<User | null>(null);
  // Este isLoading é específico para a busca dos DETALHES
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // A lógica interna não precisa mudar, pois ela já usava apenas `user.id`
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const fetchUserDetails = async () => {
      setIsLoading(true);
      try {
        // 2. A chamada é simplificada.
        // O apiClient se encarrega de buscar o token e adicionar o header "Authorization".
        // Note que o caminho é '/users/...' porque o baseURL '/api' já está no apiClient.
        const response = await apiClient.get<User>(`/users/${user.id}`);

        // A resposta do apiClient (axios) ainda tem os dados em 'response.data'.
        setUserDetails(response.data);
      } catch (err) {
        console.error("Erro ao buscar detalhes do perfil do usuário:", err);
        if (isAxiosError(err)) {
          // Se a API retornar 401 (não autorizado), o interceptor não trata,
          // mas o erro será capturado aqui, e o toast será exibido.
          const errorMessage =
            err.response?.data?.error ||
            "Não foi possível carregar os detalhes do perfil.";
          toast.error(errorMessage);
        } else {
          toast.error("Ocorreu um erro inesperado.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [user]);

  return { userDetails, isLoading };
}
