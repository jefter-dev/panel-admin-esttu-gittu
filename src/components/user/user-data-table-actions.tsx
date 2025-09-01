"use client";

import Link from "next/link";
import { Copy, Download, MoreHorizontal, QrCode, UserPen } from "lucide-react";

import { User } from "@/types/user";
import {
  downloadCanvasAsPng,
  getUrlQrCode,
  handleDownloadImage,
} from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { QrCodeValidateRegister } from "@/components/user/user-qrcode-validate-register";
import { UserPdfButton } from "@/components/user/user-pdf-button";

interface UserDataTableActionsProps {
  user: User;
}

export const UserDataTableActions: React.FC<UserDataTableActionsProps> = ({
  user,
}) => {
  const canvasId = `qrcode-main-${user.idDocument}`;
  const qrCodeUrl = getUrlQrCode(user);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(user.id);
      toast.success("ID do usuário copiado!");
    } catch {
      toast.error("Falha ao copiar o ID.");
    }
  };

  const downloadWithToast = async (
    action: () => Promise<void>,
    loadingMessage: string,
    successMessage: string,
    errorMessage: string
  ) => {
    const toastId = toast.loading(loadingMessage);
    try {
      await action();
      toast.success(successMessage, { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(errorMessage, { id: toastId });
    }
  };

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
            <Link href={`/users/${user.idDocument}`}>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <UserPen size={14} />
                Editar Usuário
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem
              onClick={handleCopyId}
              className="gap-2 cursor-pointer"
            >
              <Copy size={14} /> Copiar ID
            </DropdownMenuItem>
            <DialogTrigger asChild>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <QrCode size={14} /> Visualizar QR Code
              </DropdownMenuItem>
            </DialogTrigger>
            <DropdownMenuItem
              disabled={!user.fotoIdentificacao}
              onClick={() =>
                downloadWithToast(
                  () =>
                    handleDownloadImage(
                      user.fotoIdentificacao!,
                      `foto-${user.nome.toLowerCase()}.jpg`
                    ),
                  "Baixando foto...",
                  "Foto baixada com sucesso!",
                  "Falha ao baixar foto."
                )
              }
              className="gap-2 cursor-pointer"
            >
              <Download size={14} /> Baixar Foto
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <UserPdfButton user={user} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DialogContent className="max-w-xs">
          <div className="flex justify-center p-4">
            <QrCodeValidateRegister url={qrCodeUrl} id={canvasId} />
          </div>
          <DialogFooter>
            <Button
              className="w-full gap-2 cursor-pointer"
              onClick={() =>
                downloadWithToast(
                  async () =>
                    await downloadCanvasAsPng(
                      canvasId,
                      `qrcode-${user.idDocument}`
                    ),
                  "Baixando QR Code...",
                  "QR Code baixado com sucesso!",
                  "Falha ao baixar QR Code."
                )
              }
            >
              <Download size={14} /> Baixar QR Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
