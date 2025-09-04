import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentsTodayTable } from "@/components/payment/payments-today-table";

export function TablePaymentsToday() {
  return (
    <Card className="@container/cardblock">
      <CardHeader className="block sm:grid">
        <CardTitle>Pagamentos de hoje</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <PaymentsTodayTable />
      </CardContent>
    </Card>
  );
}
