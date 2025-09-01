"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";

import { User } from "@/types/user";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { UserDataTableActions } from "@/components/user/user-data-table-actions";
import { UserCell } from "@/components/user/user-cell";

export const columns: ColumnDef<User>[] = [
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon"
        onClick={row.getToggleExpandedHandler()}
        disabled={!row.getCanExpand()}
        className="cursor-pointer h-8 w-8"
      >
        <ChevronRight
          className={`h-4 w-4 transition-transform ${
            row.getIsExpanded() ? "rotate-90" : ""
          }`}
        />
        <span className="sr-only">Detalhes</span>
      </Button>
    ),
    // Desabilitar ordenação e ocultação para esta coluna
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "nome",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Usuário" />
    ),
    cell: ({ row }) => <UserCell user={row.original} />,
  },
  {
    accessorKey: "cpf",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CPF" />
    ),
    cell: ({ row }) => (
      <div className="w-[120px] truncate font-mono text-sm">
        {row.getValue("cpf")}
      </div>
    ),
  },
  {
    accessorKey: "celular",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Telefone" />
    ),
  },
  {
    accessorKey: "pagamentoEfetuado",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pagamento" />
    ),
    cell: ({ row }) => {
      const isPago = row.getValue("pagamentoEfetuado");
      return (
        <div className="text-center">
          <Badge variant={isPago ? "default" : "destructive"}>
            {isPago ? "Efetuado" : "Pendente"}
          </Badge>
        </div>
      );
    },
    // Função de filtro personalizada para o status do pagamento
    filterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId);
      return (
        filterValue === "all" ||
        (filterValue === "true" && value === true) ||
        (filterValue === "false" && value === false)
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Ações</div>,
    cell: ({ row }) => {
      const user = row.original;
      return <UserDataTableActions user={user} />;
    },
    enableSorting: false,
    enableHiding: false,
  },
];
