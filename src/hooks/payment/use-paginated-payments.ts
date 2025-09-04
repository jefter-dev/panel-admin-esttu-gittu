"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Payment } from "@/types/payment.type";
import { apiClient } from "@/lib/http-client";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";

const QUANTITY_INITIAL_PAGE_SIZE = 10;

interface Filters {
  search?: string;
  dateRange: DateRange;
}

export function usePaginatedPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [currentSearch, setCurrentSearch] = useState("");
  const [currentDateRange, setCurrentDateRange] = useState<DateRange>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(QUANTITY_INITIAL_PAGE_SIZE);

  const pageCursorsRef = useRef<(string | null)[]>([null]);

  useEffect(() => {
    let ignore = false;

    const loadPayments = async () => {
      setIsLoading(true);
      const cursor = pageCursorsRef.current[page - 1];

      try {
        const params: Record<string, string | number> = { limit: pageSize };
        if (cursor) params.startAfter = cursor;
        if (currentSearch?.trim()) params.search = currentSearch.trim();
        if (currentDateRange?.from)
          params.dateFrom = currentDateRange.from.toISOString();
        if (currentDateRange?.to)
          params.dateTo = currentDateRange.to.toISOString();

        const response = await apiClient.get<{
          payments: Payment[];
          hasNextPage: boolean;
        }>("/payments", { params });

        if (ignore) return;

        const { payments: fetchedPayments, hasNextPage: newHasNextPage } =
          response.data;

        setPayments(fetchedPayments ?? []);
        setHasNextPage(newHasNextPage);

        if (newHasNextPage && fetchedPayments.length > 0) {
          const lastPayment = fetchedPayments[fetchedPayments.length - 1];
          pageCursorsRef.current[page] = lastPayment.id;
        }
      } catch (error) {
        console.error("Erro ao buscar pagamentos:", error);
        if (!ignore) {
          if (isAxiosError(error)) {
            toast.error(
              error.response?.data?.error || "Falha ao carregar pagamentos."
            );
          } else {
            toast.error("Ocorreu um erro inesperado.");
          }
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadPayments();
    return () => {
      ignore = true;
    };
  }, [page, pageSize, currentSearch, currentDateRange]);

  const handleFilterChange = useCallback((filters: Filters) => {
    setPage(1);
    setCurrentSearch(filters.search ?? "");
    setCurrentDateRange(filters.dateRange);
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
    payments,
    isLoading,
    hasNextPage,
    page,
    pageSize,
    search: currentSearch,
    dateRange: currentDateRange,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
  };
}
