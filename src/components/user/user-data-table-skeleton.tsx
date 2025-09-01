import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function DataTableUsersSkeleton({
  columnCount,
  rowCount = 10,
}: {
  columnCount: number;
  rowCount?: number;
}) {
  return (
    <div className="space-y-4">
      {/* Skeleton para a Barra de Ferramentas (Filtros) */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-95" />
          <Skeleton className="h-8 w-48" />
        </div>
      </div>

      {/* Skeleton para a Tabela */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: columnCount }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-5 w-24" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: columnCount }).map((_, j) => (
                  <TableCell key={j}>
                    {/* Imita a célula de Avatar + Texto, que é a mais complexa */}
                    {j === 1 ? (
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                    ) : (
                      <Skeleton className="h-4 w-10" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Skeleton para a Paginação */}
      <div className="flex items-center justify-end gap-4 py-4">
        {/* Indicador de página */}
        <Skeleton className="h-4 w-20" />

        {/* Botões anterior / próximo */}
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}
