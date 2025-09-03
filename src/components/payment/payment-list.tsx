"use client";

import { usePaginatedPayments } from "@/hooks/payment/use-paginated-payments";
import { useCallback, useEffect, useState } from "react";
import { PaymentsDataTable } from "@/components/payment/payment-data-table";
import { PaymentsDataTableSkeleton } from "@/components/payment/payment-data-table-skeleton";
import { subDays } from "date-fns";
import { DateRange } from "react-day-picker";

export default function PaymentList() {
  const {
    payments,
    page,
    pageSize,
    hasNextPage,
    search,
    dateRange,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    isLoading,
  } = usePaginatedPayments();

  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      setInitialLoading(false);
    }
  }, [isLoading]);

  const onFilterChange = useCallback(
    (newFilters: { search: string; dateRange?: DateRange }) => {
      handleFilterChange({
        search: newFilters.search,
        dateRange: newFilters.dateRange || {
          from: subDays(new Date(), 7),
          to: new Date(),
        },
      });
    },
    [handleFilterChange]
  );

  if (initialLoading && isLoading) {
    return (
      <div className="p-4 md:p-10">
        <PaymentsDataTableSkeleton rowCount={10} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10">
      <PaymentsDataTable
        payments={payments}
        page={page}
        pageSize={pageSize}
        hasNextPage={hasNextPage}
        search={search}
        dateRange={dateRange}
        onFilterChange={onFilterChange}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
