"use client";
import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive";
import { StatCard } from "@/components/dashboard/stat-card";
import { usePaymentsCurrentMonth } from "@/hooks/dashboard/use-payments-current-month";
import { usePaymentsToday } from "@/hooks/dashboard/use-payments-today";
import { useUserStats } from "@/hooks/dashboard/use-user-stats";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const { data: userStats } = useUserStats();
  const { stats: todayStats } = usePaymentsToday();
  const { payments: monthlyPayments } = usePaymentsCurrentMonth();

  return (
    <div className="container mx-auto min-h-svh p-6 flex flex-col gap-8">
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Total de Usuários"
          value={userStats?.totalUsers ?? "-"}
        />
        <StatCard
          title="Pagamentos Confirmados"
          value={userStats?.paymentsConfirmed ?? "-"}
        />
        <StatCard
          title="Pagamentos Hoje"
          value={`${todayStats.count} (${formatCurrency(
            todayStats.totalAmount
          )})`}
          color="text-green-600"
        />
      </div>

      <ChartAreaInteractive payments={monthlyPayments} />
    </div>
  );
}
