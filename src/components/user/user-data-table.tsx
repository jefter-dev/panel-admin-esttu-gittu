"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getExpandedRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { User } from "@/types/user.type";
import { UserDetailsRow } from "@/components/user/user-datails-row";
import { columns } from "@/components/user/user-columns";
import {
  FilterPayment,
  FilterType,
  FilterValue,
} from "@/types/filters-user.type";
import { DataTableToolbar } from "@/components/user/user-data-table-toolbar";
import { DataTablePagination } from "@/components/data-table-pagination";

interface UserDataTableProps {
  users: User[];
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  search: string;
  filterPagamento: FilterPayment;
  filterType?: FilterType;
  filterValue?: FilterValue;
  onFilterChange: (filters: {
    search: string;
    pagamentoEfetuado?: boolean;
    filterType?: FilterType;
    filterValue?: FilterValue;
  }) => void;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
}

export function UserDataTable({
  users,
  page,
  pageSize,
  hasNextPage,
  search,
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
    <>
      <DataTableToolbar
        table={table}
        search={search}
        filterPagamento={filterPagamento}
        onFilterChange={onFilterChange}
      />
      <div className="overflow-x-auto">
        <div className="w-full min-w-max space-y-4">
          <div className="rounded-md border overflow-x-auto">
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
      </div>
    </>
  );
}
