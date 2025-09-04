"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePaymentsTodayList } from "@/hooks/dashboard/use-payments-today-list";
import { columns } from "@/components/payment/payment-today-columns";
import { PaymentsTodayTableSkeleton } from "@/components/payment/payments-today-table-skeleton";
import { PaymentsTodayTableEmpty } from "@/components/payment/payments-today-table-empty";

export function PaymentsTodayTable() {
  const { payments, isLoading } = usePaymentsTodayList();

  const table = useReactTable({
    data: payments,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <PaymentsTodayTableSkeleton />;
  if (payments.length === 0)
    return (
      <PaymentsTodayTableEmpty message="Nenhum pagamento realizado hoje" />
    );

  return (
    <div className="overflow-x-auto border rounded-md shadow-md">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
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
                Nenhum pagamento encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
