"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdmins } from "@/hooks/admin/use-admins";
import { TableSkeletonAdmin } from "@/components/admin/admin-table-skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { AdminTableActions } from "@/components/admin/admin-table-actions";
import { Admin } from "@/types/admin.type";
import { AdminTableToolbar } from "@/components/admin/admin-table-toolbar";
import { useSession } from "@/context/session-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AdminTable() {
  const { admins, isLoading } = useAdmins();
  const { user } = useSession();
  const userRole = user?.role ?? "user";
  const router = useRouter();

  useEffect(() => {
    if (userRole !== "admin") {
      router.replace("/dashboard");
    }
  }, [userRole, router]);

  if (isLoading) return <TableSkeletonAdmin />;

  return (
    <>
      <AdminTableToolbar admins={admins} />
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Acesso</TableHead>
              <TableHead>APP</TableHead>
              <TableHead>Criado por</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Atualizado por</TableHead>
              <TableHead>Atualizado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((admin: Admin) => (
              <TableRow key={admin.id}>
                <TableCell>{admin.name}</TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{admin.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={admin.app == "esttu" ? "secondary" : "outline"}
                  >
                    {admin.app}
                  </Badge>
                </TableCell>
                <TableCell>{admin.adminRegisterName ?? "—"}</TableCell>
                <TableCell>{formatDateTime(admin.createAt)}</TableCell>
                <TableCell>{admin.adminUpdatedName ?? "—"}</TableCell>
                <TableCell>{formatDateTime(admin.updateAt)}</TableCell>
                <TableCell className="text-right">
                  <AdminTableActions admin={admin} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
