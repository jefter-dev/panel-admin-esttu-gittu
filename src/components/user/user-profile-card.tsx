"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/context/session-context";
import { useUserDetails } from "@/hooks/use-user-details";

export function UserProfileCard() {
  const { user, isLoading: isSessionLoading } = useSession();
  const { userDetails, isLoading: isDetailsLoading } = useUserDetails(user);

  const isLoading = isSessionLoading || isDetailsLoading;

  if (isLoading) {
    return (
      <div className="text-center">
        <p className="text-foreground animate-pulse">
          Carregando dados do perfil...
        </p>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">
          Não foi possível exibir os dados do perfil.
        </p>
      </div>
    );
  }

  // O restante do seu componente que renderiza o card...
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-24 w-24 relative">
          <Image
            src={userDetails.fotoIdentificacao}
            alt={`Foto de ${userDetails.nome}`}
            layout="fill"
            objectFit="cover"
            className="rounded-full"
          />
        </div>
        <CardTitle className="text-3xl font-bold text-primary">
          {userDetails.nome} {userDetails.sobrenome}
        </CardTitle>
        <CardDescription>{userDetails.email}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
        <div>
          <p className="font-semibold text-muted-foreground">CPF</p>
          <p>{userDetails.cpf}</p>
        </div>
        <div>
          <p className="font-semibold text-muted-foreground">Celular</p>
          <p>{userDetails.celular}</p>
        </div>
        <div className="md:col-span-2">
          <p className="font-semibold text-muted-foreground">Curso</p>
          <p>
            {userDetails.curso} - {userDetails.instituicao}
          </p>
        </div>
        <div className="md:col-span-2 flex justify-center">
          <Badge
            variant={userDetails.pagamentoEfetuado ? "default" : "destructive"}
          >
            {userDetails.pagamentoEfetuado
              ? "Pagamento em dia"
              : "Pagamento pendente"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
