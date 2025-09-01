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

export function PaymentsDataTableSkeleton({
  rowCount = 8,
}: {
  rowCount?: number;
}) {
  const columns = [
    "ID",
    "Valor",
    "Cliente",
    "CPF",
    "Método",
    "Status",
    "Data do Pagamento",
  ];

  return (
    <div className="overflow-x-auto">
      <div className="w-full min-w-max space-y-4">
        {/* Toolbar Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-64" /> {/* Input de busca */}
            <Skeleton className="h-8 w-48" /> {/* Botão limpar */}
          </div>
          <Skeleton className="h-9 w-64" /> {/* DateRangePicker */}
        </div>

        {/* Tabela Skeleton */}
        <div className="rounded-md border overflow-x-auto">
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
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      {j === 0 ? ( // Coluna ID com Badge
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-12" />
                          <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                      ) : j === 2 ? ( // Cliente (nome maior)
                        <Skeleton className="h-4 w-40" />
                      ) : j === 3 ? ( // CPF
                        <Skeleton className="h-4 w-32" />
                      ) : j === 6 ? ( // Data do Pagamento
                        <Skeleton className="h-4 w-36" />
                      ) : (
                        <Skeleton className="h-4 w-20" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Paginação Skeleton */}
        <div className="flex items-center justify-end gap-4 py-4">
          <Skeleton className="h-4 w-18" /> {/* Página X de Y */}
          <Skeleton className="h-7 w-20" /> {/* Botão anterior */}
          <Skeleton className="h-7 w-20" /> {/* Botão próximo */}
        </div>
      </div>
    </div>
  );
}
