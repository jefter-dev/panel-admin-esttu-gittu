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
      // Faz login na API e pega os tokens
      const response = await axios.post<Tokens>("/api/auth/login", data);
      const tokens = response.data;

      console.log("TOKENS: ", response, tokens);

      // Salva os tokens no cookie via SessionAdapter
      await SessionAdapter.saveTokens(tokens);

      toast.success("Login realizado com sucesso!");

      // Redireciona para o dashboard
      router.push("/dashboard");
    } catch (error) {
      console.log("ERROR: ", error);

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
