"use client";

import { UserDataTable } from "@/components/user/user-data-table";
import { usePaginatedUsers } from "@/hooks/user/use-paginated-users";
import { DataTableUsersSkeleton } from "@/components/user/user-data-table-skeleton";
import { columns } from "@/components/user/user-columns";
import { useCallback } from "react";
import { FilterType } from "@/types/filters-user";

export default function UserList() {
  const {
    users,
    page,
    pageSize,
    hasNextPage,
    search,
    filterPayment,
    handleFilterChange, // Esta é a função do hook usePaginatedUsers
    handlePageChange,
    handlePageSizeChange,
    isLoading,
  } = usePaginatedUsers();

  // 👇 AQUI ESTÁ A CORREÇÃO 👇
  // Esta função agora aceita todos os filtros e os repassa corretamente
  const onFilterChange = useCallback(
    (newFilters: {
      search: string;
      pagamentoEfetuado?: boolean; // Recebe boolean
      filterType?: FilterType;
      filterValue?: string;
    }) => {
      // Chama a função do hook diretamente com os valores recebidos.
      // O hook agora é responsável por gerenciar seu próprio estado interno.
      handleFilterChange({
        search: newFilters.search,
        pagamentoEfetuado: newFilters.pagamentoEfetuado, // Passa o boolean diretamente
        filterType: newFilters.filterType,
        filterValue: newFilters.filterValue,
      });
    },
    [handleFilterChange]
  );

  if (isLoading && users.length === 0) {
    return (
      <div className="p-10">
        <DataTableUsersSkeleton columnCount={columns.length} rowCount={10} />
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
        search={search}
        filterPagamento={filterPayment}
        onFilterChange={onFilterChange} // Passando a função corrigida
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
