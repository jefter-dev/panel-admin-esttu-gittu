"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { UserX } from "lucide-react";

export function UserNotFound() {
  return (
    <Card className="max-w-md mx-auto mt-8 text-center animate-fade-in">
      <CardHeader>
        <div className="flex flex-col items-center gap-2">
          <UserX size={48} className="text-muted-foreground" />
          <CardTitle className="text-xl">Usuário não encontrado</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Não foi possível localizar o usuário no sistema. Verifique se o ID
            ou CPF estão corretos e tente novamente.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Caso o problema persista, entre em contato com o suporte.
        </p>
      </CardContent>
    </Card>
  );
}
