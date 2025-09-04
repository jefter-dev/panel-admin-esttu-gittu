"use client";

import { useState, useEffect } from "react";
import axios, { isAxiosError } from "axios";
import { toast } from "sonner";
import { User } from "@/types/user.type";
import { useSession } from "@/context/session-context";

export function useUserProfile() {
  // MUDANÇA 1: Renomeamos 'isLoading' para 'isSessionLoading' para evitar conflito e ser mais claro.
  const { user, isLoading: isSessionLoading } = useSession();

  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // O estado de loading do *perfil*

  useEffect(() => {
    // MUDANÇA 2: Se a sessão ainda estiver carregando, não faça nada. Apenas espere.
    if (isSessionLoading) {
      return;
    }

    // Se a sessão terminou de carregar, mas não há usuário, paramos o processo.
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    // A partir daqui, sabemos que a sessão está carregada E temos um ID de usuário.
    // É seguro iniciar a busca.
    const fetchUserProfile = async () => {
      // Definimos o loading do perfil como true, mas isso só acontece UMA VEZ
      // depois que a sessão já carregou.
      setIsLoading(true);

      try {
        const response = await axios.get<User>(`/api/users/${user.id}`);
        setProfile(response.data);
      } catch (err) {
        console.error("Erro ao buscar o perfil do usuário:", err);
        if (isAxiosError(err)) {
          const errorMessage =
            err.response?.data?.error ||
            "Não foi possível carregar os dados do perfil.";
          toast.error(errorMessage);
        } else {
          toast.error("Ocorreu um erro inesperado.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();

    // MUDANÇA 3: A dependência agora observa tanto o objeto 'user' quanto o 'isSessionLoading'.
    // O useEffect será reavaliado quando a sessão carregar.
  }, [user, isSessionLoading]);

  return { profile, isLoading };
}
