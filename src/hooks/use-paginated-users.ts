"use client";

import { useState, useEffect, useCallback } from "react";
import type { User } from "@/types/user";
import { apiClient } from "@/lib/http-client";
import { toast } from "sonner";
import { isAxiosError } from "axios";

const QUANTITY_INITIAL_PAGE_SIZE = 10;
export function usePaginatedUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [filterNome, setFilterNome] = useState("");
  const [filterPagamento, setFilterPagamento] = useState<
    "all" | "true" | "false"
  >("true");
  const [page, setPage] = useState(1);
  const [cursors, setCursors] = useState<(string | unknown)[]>([undefined]);
  const [pageSize, setPageSize] = useState(QUANTITY_INITIAL_PAGE_SIZE);

  // EFEITO 1: Dispara a busca
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      const cursor = cursors[page - 1];
      const pagamentoBoolean =
        filterPagamento === "true"
          ? true
          : filterPagamento === "false"
          ? false
          : undefined;

      try {
        const params = {
          limit: pageSize,
          startAfter: cursor,
          pagamentoEfetuado: pagamentoBoolean,
          nome: filterNome.trim() || undefined,
        };
        Object.keys(params).forEach(
          (key) =>
            params[key as keyof typeof params] === undefined &&
            delete params[key as keyof typeof params]
        );

        const response = await apiClient.get<{
          users: User[];
          hasNextPage: boolean;
        }>("/users", { params });

        const { users: fetchedUsers, hasNextPage: newHasNextPage } =
          response.data;

        setUsers(fetchedUsers ?? []);
        setHasNextPage(newHasNextPage);

        // Só adiciona cursor se realmente houver próxima página
        if (newHasNextPage && page >= cursors.length) {
          const lastUser = fetchedUsers[fetchedUsers.length - 1];
          if (lastUser) {
            setCursors((prev) => [...prev, lastUser.nome]);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        if (isAxiosError(error)) {
          toast.error(
            error.response?.data?.error || "Falha ao carregar usuários."
          );
        } else {
          toast.error("Ocorreu um erro inesperado.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
    // não incluir cursors aqui
  }, [page, filterNome, filterPagamento, pageSize]);

  // EFEITO 2: Gerencia os cursors (Este efeito se tornou redundante, a lógica pode ser simplificada)
  useEffect(() => {
    if (hasNextPage && page >= cursors.length) {
      const lastUser = users[users.length - 1];
      if (lastUser) {
        setCursors((prev) => [...prev, lastUser.nome]);
      }
    }
  }, [users, hasNextPage, page, cursors.length]);

  useEffect(() => {
    if (hasNextPage && page >= cursors.length) {
      const lastUser = users[users.length - 1];
      if (lastUser) {
        setCursors((prev) => [...prev, lastUser.nome]);
      }
    }
  }, [users, hasNextPage, page, cursors.length]);

  const handleFilterChange = useCallback(
    (filters: {
      nome: string;
      pagamentoEfetuado: "all" | "true" | "false";
    }) => {
      setPage(1);
      setFilterNome(filters.nome);
      setFilterPagamento(filters.pagamentoEfetuado);
      setCursors([undefined]);
    },
    []
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage > 0 && !isLoading) {
        setPage(newPage);
      }
    },
    [isLoading]
  );

  // 4. CRIAR NOVA FUNÇÃO PARA MUDAR O TAMANHO DA PÁGINA
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Sempre volta para a primeira página ao mudar o tamanho
    setCursors([undefined]);
  }, []);

  // 5. EXPORTAR O NOVO ESTADO E A NOVA FUNÇÃO
  return {
    users,
    isLoading,
    hasNextPage,
    page,
    pageSize, // Exportar o valor atual
    filterNome,
    filterPagamento,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange, // Exportar a função
  };
}
