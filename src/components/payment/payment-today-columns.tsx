"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Payment, PaymentMethod } from "@/types/payment.type";
import { formatCurrency } from "@/lib/utils";
import { UserDetailsDialog } from "@/components/user/user-datails-dialog";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "customerName",
    header: "Cliente",
    cell: ({ row }) => {
      const payment = row.original;
      return (
        <div className="flex items-center">
          <span>{payment.customerName}</span>
          {payment.userId && <UserDetailsDialog userId={payment.userId} />}
        </div>
      );
    },
  },
  {
    accessorKey: "customerCpf",
    header: "CPF",
  },
  {
    accessorKey: "description",
    header: "Descrição",
  },
  {
    accessorKey: "amount",
    header: "Valor",
    cell: ({ getValue }) => formatCurrency(getValue<number>()),
  },
  {
    accessorKey: "method",
    header: "Método",
    cell: ({ getValue }) => {
      const method = getValue<PaymentMethod>();
      return <Badge variant="default">{method}</Badge>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "paymentDate",
    header: "Data",
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return date.toLocaleString();
    },
  },
];
