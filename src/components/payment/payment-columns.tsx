import { ColumnDef } from "@tanstack/react-table";
import { Payment } from "@/types/payment.type";
import { Badge } from "@/components/ui/badge";
import { PaymentMethod, PaymentStatus } from "@/types/payment.type";
import { UserDetailsDialog } from "../user/user-datails-dialog";

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      const payment = row.original;
      const gatewayPaymentId = payment.gatewayPaymentId;
      const rowIndex = row.index + 1; // índice da linha

      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{payment.id}</span>
          <Badge variant="secondary">{gatewayPaymentId}</Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Valor",
    cell: ({ getValue }) =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(getValue<number>()),
  },
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
    cell: ({ getValue }) => getValue<string>(),
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
    cell: ({ getValue }) => getValue<PaymentStatus>(),
  },
  {
    accessorKey: "paymentDate",
    header: "Data do Pagamento",
    cell: ({ getValue }) =>
      new Date(getValue<string>()).toLocaleString("pt-BR"),
  },
];
