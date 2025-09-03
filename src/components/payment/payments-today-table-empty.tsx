"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";

export function PaymentsTodayTableEmpty({
  message = "Nenhum pagamento encontrado.",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center pb-6 text-center text-gray-500">
      <AlertCircle className="w-12 h-12 mb-4" />
      <p className="text-lg font-medium">{message}</p>
    </div>
  );
}
