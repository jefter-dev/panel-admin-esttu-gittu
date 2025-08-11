"use client";

import { useEffect } from "react";
import { useSession } from "@/context/session-context";

// Mantenha uma lista de todas as classes de tema possíveis.
// Isso é crucial para limpar o tema antigo antes de adicionar um novo.
const APP_THEME_CLASSES = ["theme-esttu", "theme-gittu"];

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useSession();

  useEffect(() => {
    // Não faça nada até que a sessão do usuário seja carregada.
    // Isso evita que o tema padrão pisque na tela antes de aplicar o tema correto.
    if (isLoading) {
      return;
    }

    const root = window.document.documentElement;

    // 1. Limpa qualquer tema de app que possa estar aplicado.
    root.classList.remove(...APP_THEME_CLASSES);

    // 2. Se o usuário tem um 'app' definido, aplica o tema correspondente.
    if (user?.app) {
      const themeClass = `theme-${user.app}`; // Ex: "theme-esttu"
      //   const themeClass = `theme-gittu`;

      // Adiciona a classe apenas se ela for uma das que preparamos no CSS.
      if (APP_THEME_CLASSES.includes(themeClass)) {
        root.classList.add(themeClass);
        console.log(`Tema aplicado: ${themeClass}`);
      }
    }

    // Se o usuário não tiver 'app', nenhum tema extra será adicionado,
    // e o tema padrão definido em ':root' será usado.
  }, [user, isLoading]); // Este efeito roda sempre que o usuário ou o estado de loading mudar.

  // Este componente não renderiza nada visualmente, apenas aplica o tema e
  // renderiza os filhos que recebe.
  return <>{children}</>;
}
