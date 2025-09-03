"use client";

import { useEffect } from "react";
import { useSession } from "@/context/session-context";

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useSession();

  useEffect(() => {
    const root = window.document.documentElement;
    const APP_THEME_CLASSES = ["theme-esttu", "theme-gittu"];
    root.classList.remove(...APP_THEME_CLASSES);

    if (user?.app) {
      const themeClass = `theme-${user.app}`;
      if (APP_THEME_CLASSES.includes(themeClass)) {
        root.classList.add(themeClass);
      }
    }
  }, [user]);

  if (isLoading) return null;

  return <>{children}</>;
}
