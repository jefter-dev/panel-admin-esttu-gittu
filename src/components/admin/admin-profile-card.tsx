"use client";

import { useAdminDetails } from "@/hooks/admin/use-admin-details";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/context/session-context";
import { AdminProfileCardSkeleton } from "@/components/admin/admin-profile-skeleton";
import { AdminProfileError } from "@/components/admin/admin-profile-error";

export function AdminProfileCard() {
  const { user: session, isLoading: isSessionLoading } = useSession();
  const { adminDetails, isLoading: isDetailsLoading } =
    useAdminDetails(session);

  const isLoading = isSessionLoading || isDetailsLoading;

  if (isLoading) {
    return <AdminProfileCardSkeleton />;
  }

  if (!adminDetails) {
    return <AdminProfileError />;
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-primary">
          {adminDetails.name}
        </CardTitle>
        <CardDescription>{adminDetails.email}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
        <div>
          <p className="font-semibold text-muted-foreground">Acesso</p>
          <Badge variant="secondary" className="capitalize">
            {adminDetails.role}
          </Badge>
        </div>
        <div>
          <p className="font-semibold text-muted-foreground">Aplicação (App)</p>
          <Badge variant="outline" className="capitalize">
            {adminDetails.app}
          </Badge>
        </div>
        <div className="sm:col-span-2">
          <p className="font-semibold text-muted-foreground">Criado em</p>
          <p>
            {new Date(adminDetails.createAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="sm:col-span-2">
          <p className="font-semibold text-muted-foreground">
            Última Atualização
          </p>
          <p>
            {new Date(adminDetails.updateAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
