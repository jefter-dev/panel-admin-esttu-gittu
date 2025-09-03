"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function PaymentsTodayTableSkeleton({
  rowCount = 8,
}: {
  rowCount?: number;
}) {
  const columns = [
    "Cliente",
    "CPF",
    "Descrição",
    "Valor",
    "Método",
    "Status",
    "Data",
  ];

  return (
    <div className="overflow-x-auto border rounded-md shadow-md">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, i) => (
              <TableHead key={i}>
                <Skeleton className="h-5 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rowCount }).map((_, i) => (
            <TableRow key={i}>
              {columns.map((col, j) => (
                <TableCell key={j}>
                  {j === 0 ? (
                    // Cliente com espaço maior
                    <Skeleton className="h-4 w-40" />
                  ) : j === 1 ? (
                    // CPF
                    <Skeleton className="h-4 w-32" />
                  ) : j === 2 ? (
                    // Descrição
                    <Skeleton className="h-4 w-48" />
                  ) : j === 3 ? (
                    // Valor
                    <Skeleton className="h-4 w-24" />
                  ) : j === 4 ? (
                    // Método
                    <Skeleton className="h-4 w-20" />
                  ) : j === 5 ? (
                    // Status
                    <Skeleton className="h-4 w-20" />
                  ) : (
                    // Data
                    <Skeleton className="h-4 w-36" />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
