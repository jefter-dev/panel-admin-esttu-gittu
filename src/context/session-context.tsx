"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
// MUDANÇA: Não precisamos mais do 'Cookies' diretamente aqui.
import { jwtDecode } from "jwt-decode";
import { SessionAdapter } from "@/lib/session-adapter"; // <-- 1. Importe seu adapter
import { SessionPayload } from "@/types/sessions";

// A interface do contexto permanece a mesma
interface SessionContextType {
  user: SessionPayload | null;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Como SessionAdapter.getAccessToken é async, criamos uma função async dentro do useEffect.
    const loadUserSession = async () => {
      try {
        // 2. Use o adapter para pegar o token. Toda a lógica de cookie e parsing está encapsulada!
        const accessToken = await SessionAdapter.getAccessToken();

        if (accessToken) {
          // A lógica de decodificação continua aqui, pois é responsabilidade do contexto.
          const decodedPayload = jwtDecode<SessionPayload>(accessToken);
          setUser(decodedPayload);
        } else {
          // Se não há token, não há usuário.
          setUser(null);
        }
      } catch (error) {
        // Este erro agora pode vir do SessionAdapter ou do jwtDecode.
        console.error("Falha ao carregar a sessão do usuário:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserSession();
  }, []); // O array vazio garante que isso rode apenas uma vez na montagem.

  const value = { user, isLoading };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

// O hook customizado não muda
export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession deve ser usado dentro de um SessionProvider");
  }
  return context;
}
