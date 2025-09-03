"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export function AdminProfileError() {
  return (
    <Card className="w-full max-w-lg mx-auto border">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-red-600 text-xl">
          <AlertCircle className="h-6 w-6" />
          Ops! Algo deu errado
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <CardDescription className="text-red-600">
          Não foi possível exibir os dados do administrador.
        </CardDescription>
        <p className="mt-2 text-sm text-red-500">
          Verifique sua conexão ou tente recarregar a página.
        </p>
      </CardContent>
    </Card>
  );
}
