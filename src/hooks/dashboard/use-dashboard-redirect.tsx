"use client";

import { useRouter } from "next/navigation";
import {
  endOfDay,
  startOfDay,
  startOfMonth,
  endOfMonth,
  format,
} from "date-fns";

/**
 * @summary Hook to redirect from the dashboard to the payments page with filters.
 */
export function useDashboardRedirect() {
  const router = useRouter();

  /** Redirects to /users page */
  const goToAllUsers = () => {
    router.push("/users");
  };

  /** Redirects to /payments without any filters */
  const goToAllPayments = () => {
    router.push("/payments");
  };

  /** Redirects to /payments with today's filter */
  const goToTodayPayments = () => {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const query = new URLSearchParams({
      dateFrom: format(todayStart, "yyyy-MM-dd"),
      dateTo: format(todayEnd, "yyyy-MM-dd"),
    });

    router.push(`/payments?${query.toString()}`);
  };

  /** Redirects to /payments with the current month's filter */
  const goToMonthPayments = () => {
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    const query = new URLSearchParams({
      dateFrom: format(monthStart, "yyyy-MM-dd"),
      dateTo: format(monthEnd, "yyyy-MM-dd"),
    });

    router.push(`/payments?${query.toString()}`);
  };

  return {
    goToAllPayments,
    goToTodayPayments,
    goToMonthPayments,
    goToAllUsers,
  };
}
