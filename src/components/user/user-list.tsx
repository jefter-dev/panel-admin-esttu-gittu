"use client";

import { UserDataTable } from "@/components/user/user-data-table";
import { usePaginatedUsers } from "@/hooks/use-paginated-users";
import { DataTableSkeleton } from "@/components/data-table-skeleton";
import { columns } from "@/components/user/user-columns";
import { useCallback } from "react"; // 1. Importe o useCallback

export default function UserList() {
  const {
    users,
    page,
    pageSize,
    hasNextPage,
    filterNome,
    filterPagamento,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    isLoading,
  } = usePaginatedUsers();

  // 2. Envolva a função 'onFilterChange' com useCallback
  // Isso garante que a função só será recriada se 'handleFilterChange' mudar.
  // Como 'handleFilterChange' também usa useCallback, ela é estável.
  const onFilterChange = useCallback(
    (newFilters: { nome: string; pagamentoEfetuado?: boolean }) => {
      const pagamentoValue =
        newFilters.pagamentoEfetuado === undefined
          ? "all"
          : (String(newFilters.pagamentoEfetuado) as "true" | "false");

      handleFilterChange({
        nome: newFilters.nome,
        pagamentoEfetuado: pagamentoValue,
      });
    },
    [handleFilterChange]
  );

  if (isLoading && users.length === 0) {
    return (
      <div className="p-10">
        <DataTableSkeleton columnCount={columns.length} rowCount={15} />
      </div>
    );
  }

  return (
    <div className="p-10">
      <UserDataTable
        users={users}
        page={page}
        pageSize={pageSize}
        hasNextPage={hasNextPage}
        filterNome={filterNome}
        filterPagamento={filterPagamento}
        onFilterChange={onFilterChange} // 3. Passe a função estável
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
