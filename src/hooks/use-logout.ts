"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SessionAdapter } from "@/lib/session-adapter";

export function useLogout() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const submit = async () => {
    setIsLoading(true);
    try {
      // Remove os tokens salvos nos cookies
      await SessionAdapter.clearTokens();

      toast.success("Logout realizado com sucesso!");
      router.push("/");
    } catch (error) {
      console.error("Erro no logout:", error);
      toast.error("Erro ao fazer logout. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submit,
    isLoading,
  };
}
