"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getExpandedRowModel,
  Table as TanstackTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User } from "@/types/user";
import { UserDetailsRow } from "./user-datails-row";
import { columns } from "@/components/user/user-columns";

interface UserDataTableProps {
  users: User[];
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  filterNome: string;
  filterPagamento: "all" | "true" | "false";
  onFilterChange: (filters: {
    nome: string;
    pagamentoEfetuado?: boolean;
  }) => void;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
}

interface DataTableToolbarProps<TData> {
  table: TanstackTable<TData>;
  filterNome: string;
  filterPagamento: "all" | "true" | "false";
  onFilterChange: (filters: {
    nome: string;
    pagamentoEfetuado?: boolean;
  }) => void;
}

function DataTableToolbar<TData>({
  filterNome,
  filterPagamento,
  onFilterChange,
}: DataTableToolbarProps<TData>) {
  const [currentNome, setCurrentNome] = React.useState(filterNome);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange({
        nome: currentNome,
        pagamentoEfetuado:
          filterPagamento === "all" ? undefined : filterPagamento === "true",
      });
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [currentNome, filterPagamento, onFilterChange]);

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Filtrar por nome..."
          value={currentNome}
          onChange={(event) => setCurrentNome(event.target.value)}
          className="max-w-sm"
        />
        <Select
          value={filterPagamento}
          onValueChange={(value) =>
            onFilterChange({
              nome: currentNome,
              pagamentoEfetuado: value === "all" ? undefined : value === "true",
            })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status Pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="true">Pagamento Efetuado</SelectItem>
            <SelectItem value="false">Pagamento Pendente</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
}

function DataTablePagination({
  page,
  pageSize,
  hasNextPage,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <p className="text-sm font-medium">Linhas por página</p>
        <Select
          value={`${pageSize}`}
          onValueChange={(value) => {
            onPageSizeChange(Number(value));
          }}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder="tetse" />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 15, 25, 50, 100].map((size) => (
              <SelectItem key={size} value={`${size}`}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
          Página {page}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNextPage}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}

export function UserDataTable({
  users,
  page,
  pageSize,
  hasNextPage,
  filterNome,
  filterPagamento,
  onFilterChange,
  onPageChange,
  onPageSizeChange,
}: UserDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    state: {
      sorting,
    },
    manualPagination: true,
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        filterNome={filterNome}
        filterPagamento={filterPagamento}
        onFilterChange={onFilterChange}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableRow>
                      <TableCell colSpan={columns.length}>
                        <UserDetailsRow user={row.original} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination
        page={page}
        pageSize={pageSize}
        hasNextPage={hasNextPage}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
