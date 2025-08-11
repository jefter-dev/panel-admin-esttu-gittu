"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/types/user";
import {
  ArrowUpDown,
  ChevronRight,
  Download,
  MoreHorizontal,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QRCode } from "react-qrcode-logo";
import {
  downloadCanvasAsPng,
  getUrlQrCode,
  handleDownloadImage,
} from "@/lib/utils";

// As primeiras colunas permanecem as mesmas
export const columns: ColumnDef<User>[] = [
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon"
        onClick={row.getToggleExpandedHandler()}
        disabled={!row.getCanExpand()}
        className="cursor-pointer h-8 w-8"
      >
        <ChevronRight
          className={`h-4 w-4 transition-transform ${
            row.getIsExpanded() ? "rotate-90" : ""
          }`}
        />
        <span className="sr-only">Detalhes</span>
      </Button>
    ),
  },
  {
    id: "user",
    accessorKey: "nome",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Usuário
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const user = row.original;
      const initial =
        (user.nome?.charAt(0) ?? "") + (user.sobrenome?.charAt(0) ?? "");

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.fotoIdentificacao} alt={user.nome} />
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-foreground">
              {user.nome} {user.sobrenome}
            </span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "cpf",
    header: "CPF",
    cell: ({ row }) => (
      <div className="w-[150px] truncate">{row.getValue("cpf")}</div>
    ),
  },
  {
    accessorKey: "celular",
    header: "Telefone",
  },
  {
    accessorKey: "pagamentoEfetuado",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Pagamento
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const isPago = row.getValue("pagamentoEfetuado");
      return (
        <div className="text-center">
          <Badge variant={isPago ? "default" : "destructive"}>
            {isPago ? "Efetuado" : "Pendente"}
          </Badge>
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId);
      return (
        filterValue === "all" ||
        (filterValue === "true" && value === true) ||
        (filterValue === "false" && value === false)
      );
    },
  },

  // =========================================================
  // COLUNA DE AÇÕES MODIFICADA
  // =========================================================
  {
    id: "actions",
    header: () => <div className="text-right">Ações</div>,
    cell: ({ row }) => {
      const user = row.original;

      const qrCodeUrl = getUrlQrCode(user);
      const canvasId = `qrcode-main-${user.idDocument}`;

      return (
        <div className="text-right">
          <Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                  <span className="sr-only">Abrir menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={!user.fotoIdentificacao}
                  onClick={() =>
                    handleDownloadImage(
                      user.fotoIdentificacao!,
                      "foto-identificacao.jpg"
                    )
                  }
                  className="cursor-pointer gap-2"
                >
                  <Download size={14} />
                  Baixar Foto
                </DropdownMenuItem>

                <DialogTrigger asChild>
                  <DropdownMenuItem className="cursor-pointer gap-2">
                    <QrCode size={14} />
                    Visualizar QR Code
                  </DropdownMenuItem>
                </DialogTrigger>

                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                  Editar/Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent className="max-w-xs">
              <div className="flex justify-center p-4">
                <QRCode
                  value={qrCodeUrl}
                  size={800}
                  style={{ width: 400, height: 400 }}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  quietZone={6}
                  id={canvasId}
                  ecLevel="H"
                  qrStyle="dots"
                />
              </div>
              <DialogFooter>
                <Button
                  className="cursor-pointer gap-2"
                  onClick={() =>
                    downloadCanvasAsPng(canvasId, `qrcode-${user.idDocument}`)
                  }
                >
                  <Download size={14} /> Baixar QR Code
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
    },
  },
];
