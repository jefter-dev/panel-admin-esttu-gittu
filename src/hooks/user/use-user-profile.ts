"use client";

import { useState, useEffect } from "react";
import axios, { isAxiosError } from "axios";
import { toast } from "sonner";
import { User } from "@/types/user.type";
import { useSession } from "@/context/session-context";

export function useUserProfile() {
  const { user, isLoading: isSessionLoading } = useSession();

  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isSessionLoading) {
      return;
    }

    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
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
  }, [user, isSessionLoading]);

  return { profile, isLoading };
}
