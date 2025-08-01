"use client";

import { useState, useEffect, useCallback } from "react";
import type { User } from "@/types/user-esttu";
import { UserDataTable } from "@/components/user-data-table";
import { ThemeToggle } from "@/components/theme-toggle";
import { getPaginationUsers } from "@/actions/users/get-pagination-users-esttu";

type AppName = "esttu" | "gittu";

export default function UsersApp({ app }: { app: AppName }) {
  // === ESTADOS ===
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [filterNome, setFilterNome] = useState("");
  const [filterPagamento, setFilterPagamento] = useState<"all" | "true" | "false">("true");
  const [page, setPage] = useState(1);
  const [cursors, setCursors] = useState<(string | undefined)[]>([undefined]);

  // === FUNÇÃO DE BUSCA ===
  const loadUsers = useCallback(async () => {
    setIsLoading(true);

    const cursor = cursors[page - 1];
    const pagamentoBoolean =
      filterPagamento === "true"
        ? true
        : filterPagamento === "false"
        ? false
        : undefined;

    const result = await getPaginationUsers(app, {
      limit: 15,
      startAfter: cursor,
      pagamentoEfetuado: pagamentoBoolean,
      nome: filterNome.trim(),
    });

    setUsers(result.users ?? []);
    setHasNextPage(result.hasNextPage);

    if (result.hasNextPage && page >= cursors.length) {
      const lastUser = result.users[result.users.length - 1];
      if (lastUser) {
        setCursors(prev => [...prev, lastUser.nome]);
      }
    }

    setIsLoading(false);
  }, [app, page, filterNome, filterPagamento, cursors]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // === HANDLERS ===
  function handleFilterChange(filters: { nome: string; pagamentoEfetuado: "all" | "true" | "false" }) {
    setPage(1);
    setFilterNome(filters.nome);
    setFilterPagamento(filters.pagamentoEfetuado);
    setCursors([undefined]);
  }

  function handlePageChange(newPage: number) {
    if (newPage > 0 && !isLoading) {
      setPage(newPage);
    }
  }

  // === RENDER ===
  return (
    <div className="p-10">
      <ThemeToggle />
      <UserDataTable
        users={users}
        page={page}
        hasNextPage={hasNextPage}
        filterNome={filterNome}
        filterPagamento={filterPagamento}
        onFilterChange={(newFilters) => {
          const pagamentoValue =
            newFilters.pagamentoEfetuado === undefined
              ? "all"
              : String(newFilters.pagamentoEfetuado) as "true" | "false";

          handleFilterChange({ nome: newFilters.nome, pagamentoEfetuado: pagamentoValue });
        }}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
