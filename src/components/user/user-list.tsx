"use client";

import { useState, useEffect, useCallback } from "react";
import { UserDataTable } from "@/components/user/user-data-table";
import { usePaginatedUsers } from "@/hooks/user/use-paginated-users";
import { DataTableUsersSkeleton } from "@/components/user/user-data-table-skeleton";
import { columns } from "@/components/user/user-columns";
import { FilterType } from "@/types/filters-user.type";

export default function UserList() {
  const {
    users,
    page,
    pageSize,
    hasNextPage,
    search,
    filterPayment,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    isLoading,
  } = usePaginatedUsers();

  // 🔹 Controla se é o primeiro carregamento
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      setInitialLoading(false);
    }
  }, [isLoading]);

  const onFilterChange = useCallback(
    (newFilters: {
      search: string;
      pagamentoEfetuado?: boolean;
      filterType?: FilterType;
      filterValue?: string;
    }) => {
      handleFilterChange({
        search: newFilters.search,
        pagamentoEfetuado: newFilters.pagamentoEfetuado,
        filterType: newFilters.filterType,
        filterValue: newFilters.filterValue,
      });
    },
    [handleFilterChange]
  );

  if (initialLoading && isLoading) {
    return (
      <div className="p-4 md:p-10">
        <DataTableUsersSkeleton columnCount={columns.length} rowCount={10} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10">
      <UserDataTable
        users={users}
        page={page}
        pageSize={pageSize}
        hasNextPage={hasNextPage}
        search={search}
        filterPagamento={filterPayment}
        onFilterChange={onFilterChange}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
