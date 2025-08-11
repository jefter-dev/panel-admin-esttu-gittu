"use client";

import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/use-logout";

export default function SettingsPage() {
  const { submit: logout, isLoading } = useLogout();

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10 gap-4">
      <h1 className="text-2xl font-bold">Configurações</h1>
      <Button onClick={logout} disabled={isLoading}>
        {isLoading ? "Saindo..." : "Logout"}
      </Button>
    </div>
  );
}
