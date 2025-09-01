"use client";

import Link from "next/link";
import { MoreHorizontal, UserPen, Trash2 } from "lucide-react";
import { Admin } from "@/types/admin";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useDeleteAdmin } from "@/hooks/admin/use-delete-admin";

interface AdminTableActionsProps {
  admin: Admin;
}

export const AdminTableActions: React.FC<AdminTableActionsProps> = ({
  admin,
}) => {
  const [open, setOpen] = useState(false);
  const { deleteAdmin, isDeleting } = useDeleteAdmin();

  const handleConfirmDelete = async () => {
    await deleteAdmin(admin);
    setOpen(false);
  };

  return (
    <div className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link href={`/admins/${admin.id}`}>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <UserPen size={14} />
              Editar Admin
            </DropdownMenuItem>
          </Link>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()} // impede fechar o menu ao abrir o modal
                className="gap-2 cursor-pointer text-red-600"
              >
                <Trash2 size={14} />
                Remover Admin
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remover Admin</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja remover{" "}
                  <span className="font-semibold">{admin.name}</span>? Essa ação
                  não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="cursor-pointer"
                >
                  {isDeleting ? "Removendo..." : "Remover"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
