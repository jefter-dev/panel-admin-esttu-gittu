"use client";

import { ChartInteractivePayments } from "@/components/dashboard/chart-payments/chart-interactive-payments";
import { StatCard } from "@/components/dashboard/stat-card";
import { usePaymentsMonth } from "@/hooks/dashboard/use-payments-month";
import { usePaymentsToday } from "@/hooks/dashboard/use-payments-today";
import { useUserStats } from "@/hooks/dashboard/use-user-stats";
import { formatCurrency } from "@/lib/utils";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import * as React from "react";
import { TablePaymentsToday } from "@/components/dashboard/table-payments-today";
import { useDashboardRedirect } from "@/hooks/dashboard/use-dashboard-redirect";

export default function DashboardPage() {
  const { stats: userStats, isLoading: isLoadingUsers } = useUserStats();
  const { stats: todayStats, isLoading: isLoadingToday } = usePaymentsToday();
  const { stats: monthStats, isLoading: isLoadingMonth } = usePaymentsMonth();
  const {
    goToAllUsers,
    goToAllPayments,
    goToTodayPayments,
    goToMonthPayments,
  } = useDashboardRedirect();

  const [initialLoading, setInitialLoading] = React.useState(true);

  React.useEffect(() => {
    if (!isLoadingUsers && !isLoadingToday && !isLoadingMonth) {
      setInitialLoading(false);
    }
  }, [isLoadingUsers, isLoadingToday, isLoadingMonth]);

  if (initialLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="container mx-auto min-h-svh p-6 flex flex-col gap-8">
      <div className="grid gap-6 md:grid-cols-4">
        <StatCard
          title="Total de usuários"
          value={userStats?.totalUsers ?? "-"}
          onClick={goToAllUsers}
        />
        <StatCard
          title="Pagamentos confirmados"
          value={userStats?.paymentsConfirmed ?? "-"}
          onClick={goToAllPayments}
        />
        <StatCard
          title="Pagamentos | Hoje"
          value={`${todayStats.count} (${formatCurrency(
            todayStats.totalAmount
          )})`}
          onClick={goToTodayPayments}
          color="text-green-600"
        />
        <StatCard
          title="Pagamentos | Mês"
          value={`${monthStats.count} (${formatCurrency(
            monthStats.totalAmount
          )})`}
          onClick={goToMonthPayments}
          color="text-green-600"
        />
      </div>

      <TablePaymentsToday />

      <ChartInteractivePayments />
    </div>
  );
}
