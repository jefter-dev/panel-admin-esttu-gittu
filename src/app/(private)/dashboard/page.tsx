"use client";

import { useLogout } from "@/hooks/use-logout";

// Importe componentes do shadcn/ui para um teste visual completo
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/context/session-context";

export default function DashboardPage() {
  const { submit: logout, isLoading: isLogoutLoading } = useLogout();
  const { user, isLoading } = useSession();

  // O estado de carregamento continua sendo importante
  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <p className="text-foreground">Carregando sessão...</p>
      </div>
    );
  }

  // Se, por algum motivo, não houver usuário, mostre uma mensagem de erro.
  if (!user) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <p className="text-destructive">
          Não foi possível carregar os dados do usuário.
        </p>
      </div>
    );
  }

  return (
    // O container principal usa as variáveis --background e --foreground automaticamente
    <div className="container mx-auto flex min-h-svh flex-col items-center justify-center gap-8 p-4 md:p-8">
      {/* Usamos um Card para agrupar as informações. Ele usará as variáveis --card e --card-foreground */}
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            Bem-vindo, <span className="text-primary">{user.name}</span>!
          </CardTitle>
          <CardDescription>
            Você está logado na plataforma{" "}
            <span className="font-semibold capitalize">{user.app}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p>Seu e-mail: {user.email}</p>
          <Badge variant="secondary">Seu cargo: {user.role}</Badge>
        </CardContent>
      </Card>

      {/* Card de teste de componentes para ver o tema em ação */}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Paleta de Teste</CardTitle>
          <CardDescription>
            Veja os componentes com o tema de{" "}
            <span className="font-semibold capitalize">{user.app}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-center gap-4">
          <Button>Botão Primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="destructive">Destrutivo</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </CardContent>
      </Card>

      <Button
        onClick={logout}
        disabled={isLogoutLoading}
        variant="destructive"
        className="w-full max-w-md"
      >
        {isLogoutLoading ? "Saindo..." : "Fazer Logout"}
      </Button>
    </div>
  );
}
