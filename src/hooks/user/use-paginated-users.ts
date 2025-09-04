"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { User } from "@/types/user.type";
import { apiClient } from "@/lib/http-client";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { FilterPayment, FilterType } from "@/types/filters-user.type";

const QUANTITY_INITIAL_PAGE_SIZE = 10;

interface Filters {
  search?: string;
  pagamentoEfetuado?: boolean;
  filterType?: FilterType;
  filterValue?: string;
}

export function usePaginatedUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [currentSearch, setCurrentSearch] = useState("");
  const [filterPayment, setFilterPayment] = useState<FilterPayment>("all");
  const [filterType, setFilterType] = useState<FilterType | "">("");
  const [filterValue, setFilterValue] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(QUANTITY_INITIAL_PAGE_SIZE);

  // ref para cursors, evita warnings do useEffect
  const pageCursorsRef = useRef<(string | null)[]>([null]);

  useEffect(() => {
    let ignore = false;

    const loadUsers = async () => {
      setIsLoading(true);

      const cursor = pageCursorsRef.current[page - 1];

      const pagamentoBoolean =
        filterPayment === "true"
          ? true
          : filterPayment === "false"
          ? false
          : undefined;

      try {
        const params: Record<string, string | number | boolean | undefined> = {
          limit: pageSize,
          pagamentoEfetuado: pagamentoBoolean,
        };

        if (cursor) params.startAfter = cursor;

        const searchTerm = currentSearch?.trim();
        if (searchTerm) params.search = searchTerm;

        const filterValueTrimmed = filterValue.trim();
        if (filterType && filterValueTrimmed) {
          params.filterType = filterType;
          params.filterValue = filterValueTrimmed;
        }

        const response = await apiClient.get<{
          users: User[];
          hasNextPage: boolean;
        }>("/users", { params });

        if (ignore) return;

        const { users: fetchedUsers, hasNextPage: newHasNextPage } =
          response.data;

        setUsers(fetchedUsers ?? []);
        setHasNextPage(newHasNextPage);

        if (newHasNextPage && fetchedUsers.length > 0) {
          const lastUser = fetchedUsers[fetchedUsers.length - 1];
          pageCursorsRef.current[page] = lastUser.idDocument;
        }
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        if (!ignore) {
          if (isAxiosError(error)) {
            toast.error(
              error.response?.data?.error || "Falha ao carregar usuários."
            );
          } else {
            toast.error("Ocorreu um erro inesperado.");
          }
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadUsers();

    return () => {
      ignore = true;
    };
  }, [page, pageSize, currentSearch, filterPayment, filterType, filterValue]); // não precisa do pageCursorsRef nas deps

  const handleFilterChange = useCallback((filters: Filters) => {
    setPage(1);
    setCurrentSearch(filters.search ?? "");
    setFilterPayment(
      filters.pagamentoEfetuado === undefined
        ? "all"
        : filters.pagamentoEfetuado
        ? "true"
        : "false"
    );
    setFilterType(filters.filterType ?? "");
    setFilterValue(filters.filterValue ?? "");
    pageCursorsRef.current = [null];
  }, []);

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage > 0 && !isLoading) {
        if (newPage > page && !hasNextPage) return;
        setPage(newPage);
      }
    },
    [isLoading, page, hasNextPage]
  );

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
    pageCursorsRef.current = [null];
  }, []);

  return {
    users,
    isLoading,
    hasNextPage,
    page,
    pageSize,
    search: currentSearch,
    filterPayment,
    filterType,
    filterValue,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
  };
}
