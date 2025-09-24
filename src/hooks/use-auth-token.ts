"use client";

import { SessionAdapter } from "@/lib/session-adapter";
import { useEffect, useState } from "react";

/**
 * Hook para obter o access token armazenado nos cookies via SessionAdapter.
 * - Retorna o token (ou null se não existir).
 * - Atualiza automaticamente quando o componente monta.
 */
export function useAuthToken() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadToken() {
      const accessToken = await SessionAdapter.getAccessToken();
      if (mounted) {
        setToken(accessToken);
      }
    }

    loadToken();

    return () => {
      mounted = false;
    };
  }, []);

  return token;
}
