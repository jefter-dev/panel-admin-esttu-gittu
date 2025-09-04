"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios, { isAxiosError } from "axios";
import { toast } from "sonner";
import { z } from "zod";
import { loginSchema } from "@/schemas/login.schema";
import { Tokens } from "@/types/sessions-type";
import { SessionAdapter } from "@/lib/session-adapter";

type LoginFormData = z.infer<typeof loginSchema>;

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const submit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await axios.post<Tokens>("/api/auth/login", data);
      const tokens = response.data;

      await SessionAdapter.saveTokens(tokens);

      toast.success("Login realizado com sucesso!");

      router.push("/dashboard");
    } catch (error) {
      if (isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error || "Erro ao fazer login.";
        toast.error(errorMessage);
      } else {
        console.error("Erro inesperado no login:", error);
        toast.error("Ocorreu um erro inesperado. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submit,
    isLoading,
  };
}
