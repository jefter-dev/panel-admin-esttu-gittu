"use client"

import { ColumnDef } from "@tanstack/react-table"
import { User } from "@/types/user-esttu"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "pagamentoEfetuado",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Pagamento
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue("pagamentoEfetuado") as boolean | undefined;
      const rawData = row.original.dataPagamento;

      console.log("📅 Debug pagamentoEfetuado:", value, "dataPagamento:", rawData);

      return (
        <div className="text-center space-y-1">
          <Badge variant={value ? "default" : "destructive"}>
            {value ? "Efetuado" : "Pendente"}
          </Badge>
          {/* Mostra a data sempre para debug */}
          <div className="text-xs text-muted-foreground">
            {rawData ? format(new Date((rawData as string)), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR }) : "Sem data"}
          </div>
        </div>
      );
    },
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId);
      return filterValue === "all" ||
        (filterValue === "true" && value === true) ||
        (filterValue === "false" && value === false);
    },
  },
  {
    accessorKey: "nome",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Nome
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "sobrenome",
    header: "Sobrenome",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "cpf",
    header: "CPF",
  },
  {
    accessorKey: "celular",
    header: "Celular",
  },
  {
    id: "enderecoCompleto",
    header: "Endereço",
    cell: ({ row }) => {
      const user = row.original;

      const linha1 = `${user.endereco}, ${user.numero}`;
      const linha2 = user.complemento ? ` - ${user.complemento}` : "";
      const linha3 = `CEP ${user.cep} - ${user.cidade}/${user.estado}`;

      return (
        <div className="text-sm leading-tight text-muted-foreground">
          <div>{linha1}{linha2}</div>
          <div>{linha3}</div>
        </div>
      );
    },
  }
]
