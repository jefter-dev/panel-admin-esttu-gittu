"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { SessionAdapter } from "@/lib/session-adapter";
import { SessionPayload } from "@/types/sessions-type";

interface SessionContextType {
  user: SessionPayload | null;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserSession = async () => {
      try {
        const accessToken = await SessionAdapter.getAccessToken();

        if (accessToken) {
          const decodedPayload = jwtDecode<SessionPayload>(accessToken);
          setUser(decodedPayload);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Falha ao carregar a sessão do usuário:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserSession();
  }, []);

  const value = { user, isLoading };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession deve ser usado dentro de um SessionProvider");
  }
  return context;
}
