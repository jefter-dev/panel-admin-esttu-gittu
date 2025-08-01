"use client";

import * as React from "react";
import {
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { User } from "@/types/user-esttu";
import { columns } from "./user-columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  users: User[];
  page: number;
  hasNextPage: boolean;
  filterNome: string;
  filterPagamento: "all" | "true" | "false";
  onFilterChange: (filters: {
    nome: string;
    pagamentoEfetuado: boolean | undefined;
  }) => void;
  onPageChange: (page: number) => void;
}

export function UserDataTable({
  users,
  page,
  hasNextPage,
  filterNome,
  filterPagamento,
  onFilterChange,
  onPageChange,
}: Props) {
  // Controle local só para ordenação (pode ser expandido)
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: hasNextPage ? page + 1 : page,
  });

  // Ao alterar o filtro nome
  function handleNomeChange(e: React.ChangeEvent<HTMLInputElement>) {
    onFilterChange({
      nome: e.target.value,
      pagamentoEfetuado:
        filterPagamento === "true"
          ? true
          : filterPagamento === "false"
          ? false
          : undefined,
    });
  }

  // Ao alterar o filtro pagamentoEfetuado
  function handlePagamentoChangeValue(value: string) {
    onFilterChange({
      nome: filterNome,
      pagamentoEfetuado:
        value === "true" ? true : value === "false" ? false : undefined,
    });
  }

  return (
    <div className="w-full">
      <div className="flex items-center space-x-4 py-4">
        <Input
          placeholder="Filtrar por nome..."
          value={filterNome}
          onChange={handleNomeChange}
          className="max-w-sm"
        />

        <Select
          value={filterPagamento}
          onValueChange={handlePagamentoChangeValue}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Filtrar pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="true">Pagos</SelectItem>
            {/* <SelectItem value="false">Pendentes</SelectItem> */}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          className="cursor-pointer"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </Button>

        <Button
          className="cursor-pointer"
          variant="outline"
          size="sm"
          disabled={!hasNextPage}
          onClick={() => onPageChange(page + 1)}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
