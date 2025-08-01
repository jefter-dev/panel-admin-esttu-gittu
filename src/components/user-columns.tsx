"use client"

import { ColumnDef } from "@tanstack/react-table"
import { User } from "@/types/user-esttu"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Image from "next/image"

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter
} from "@/components/ui/dialog"

import { QRCode } from "react-qrcode-logo";

export const columns: ColumnDef<User>[] = [


{
  id: "fotoIdentificacao",
  header: "Foto",
  cell: ({ row }) => {
    const src = row.original.fotoIdentificacao;

    if (!src) {
      return <span className="text-muted-foreground text-xs">Sem foto</span>;
    }

    const handleDownload = async () => {
      try {
        const res = await fetch("/api/download-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: src }),
        });

        if (!res.ok) throw new Error("Falha no download");

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "foto-identificacao.jpg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Erro ao baixar imagem:", err);
        alert("Erro ao baixar imagem");
      }
    };

    return (
      <div className="flex flex-col items-center space-y-1">
        <div className="w-12 h-12 relative rounded overflow-hidden border">
          <Image
            src={src}
            alt="Foto de identificação"
            fill
            priority
            className="object-cover"
          />
        </div>
        <Button className="cursor-pointer" size="sm" variant="outline" onClick={handleDownload}>
          Baixar
        </Button>
      </div>
    );
  },
},


{
  id: "qrCodeCarteirinha",
  header: "QR Code",
  cell: ({ row }) => {
    const user = row.original;

    const baseUrl = "https://esttu-ec034.web.app/#/carteirinha";
    const userEncoded = encodeURIComponent(JSON.stringify({
      id: user.id,
      nome: user.nome,
      sobrenome: user.sobrenome,
      dataNascimento: user.dataNascimento,
      cpf: user.cpf,
      instituicao: user.instituicao,
      curso: user.curso,
      anoParaRenovacao: user.anoParaRenovacao,
      fotoIdentificacao: user.fotoIdentificacao,
    }));

    const qrCodeUrl = `${baseUrl}?user=${userEncoded}`;
    const canvasId = `qrcode-${user.id}`;

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button className="cursor-pointer" variant="outline" size="sm">
            Visualizar QR Code
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm bg-white w-full text-center">
          <div className="flex justify-center items-center p-4">
            <QRCode
            value={qrCodeUrl}
            size={800}
            style={{ width: 400, height: 400 }}
            bgColor="#ffffff"
            fgColor="#000000"
            quietZone={6}
            id={canvasId}
            logoImage="/logo.png"
            logoWidth={230}
            logoHeight={230}
            logoOpacity={1}
            ecLevel="H"
            qrStyle="dots"
          />
          </div>

          <DialogFooter>
            variant="default"
            <Button
              className="cursor-pointer"
              onClick={() => {
                const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
                if (!canvas) return;

                const link = document.createElement("a");
                link.href = canvas.toDataURL("image/png");
                link.download = `qrcode-${user.id}.png`;
                link.click();
              }}
            >
              Baixar QR Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
},

  {
    id: "nome",
    header: "Nome",
    cell: ({ row }) => {
      const user = row.original;

      const nome = user.nome || "";
      const sobrenome = user.sobrenome || "";

      return (
        `${nome} ${sobrenome}`
      );
    },
  },
  {
    accessorKey: "sobrenome",
    header: "Sobrenome",
  },
  {
    accessorKey: "rg",
    header: "Rg",
  },
  {
    accessorKey: "cpf",
    header: "CPF",
  },
  {
    accessorKey: "dataNascimento",
    header: "Data nascimento",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "celular",
    header: "Celular",
  },
  {
    id: "enderecoCompleto",
    header: "Endereço",
    cell: ({ row }) => {
      const user = row.original;

      const linha1 = `${user.endereco}, ${user.numero}`;
      const linha2 = user.complemento ? ` - ${user.complemento}` : "";
      const linha3 = `CEP ${user.cep} - ${user.cidade}/${user.estado}`;

      return (
        <div className="text-sm leading-tight text-muted-foreground">
          <div>{linha1}{linha2}</div>
          <div>{linha3}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "pagamentoEfetuado",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Pagamento
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue("pagamentoEfetuado") as boolean | undefined;
      const rawData = row.original.dataPagamento;

      console.log("📅 Debug pagamentoEfetuado:", value, "dataPagamento:", rawData);

      return (
        <div className="text-center space-y-1">
          <Badge variant={value ? "default" : "destructive"}>
            {value ? "Efetuado" : "Pendente"}
          </Badge>
          {/* Mostra a data sempre para debug */}
          <div className="text-xs text-muted-foreground">
            {rawData ? format(new Date((rawData as string)), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR }) : "Sem data"}
          </div>
        </div>
      );
    },
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId);
      return filterValue === "all" ||
        (filterValue === "true" && value === true) ||
        (filterValue === "false" && value === false);
    },
  },
]
