import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, QrCode } from "lucide-react";
import {
  downloadCanvasAsPng,
  getUrlQrCode,
  handleDownloadImage,
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { QrCodeValidateRegister } from "@/components/user/user-qrcode-validate-register";

function DetailItem({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) {
  if (!value) return null;
  return (
    <div className="min-w-0">
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground whitespace-normal break-words">
        {value}
      </p>
    </div>
  );
}

// Documentos
function UserDocuments({ user }: { user: User }) {
  const qrCodeUrl = getUrlQrCode(user);
  const canvasId = `qrcode-expanded-${user.idDocument}`;

  return (
    <div className="space-y-4">
      <h4 className="font-bold text-foreground">Documentos</h4>
      {user.fotoIdentificacao && (
        <div className="flex flex-col items-start gap-2">
          <p className="text-sm font-semibold text-muted-foreground">Foto</p>
          <div className="w-24 h-24 relative rounded-md overflow-hidden border">
            <Image
              src={user.fotoIdentificacao}
              alt="Foto"
              fill
              className="object-cover"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer gap-2"
            onClick={() =>
              handleDownloadImage(
                user.fotoIdentificacao!,
                "foto-identificacao.jpg"
              )
            }
          >
            <Download size={14} />
            Baixar
          </Button>
        </div>
      )}

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="cursor-pointer gap-2">
            <QrCode size={14} /> QR Code
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-xs">
          <div className="flex justify-center p-4">
            <QrCodeValidateRegister url={qrCodeUrl} id={canvasId} />
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
}

// Dados Pessoais
function UserPersonalData({ user }: { user: User }) {
  return (
    <div className="space-y-4">
      <h4 className="font-bold text-foreground">Dados Pessoais</h4>
      <DetailItem label="ID" value={user.cid || user.id} />
      <DetailItem label="CPF" value={user.cpf} />
      <DetailItem label="RG" value={user.rg} />
      <DetailItem label="Data de Nascimento" value={user.dataNascimento} />
      <DetailItem label="Celular" value={user.celular} />
    </div>
  );
}

// Endereço + Financeiro
function UserAddressAndFinance({ user }: { user: User }) {
  return (
    <div className="space-y-4">
      <h4 className="font-bold text-foreground">Endereço</h4>
      <DetailItem label="CEP" value={user.cep} />
      <DetailItem
        label="Cidade / Estado"
        value={`${user.cidade} - ${user.estado}`}
      />
      <DetailItem
        label="Logradouro"
        value={`${user.endereco}, ${user.numero} - ${user.complemento}`}
      />

      <h4 className="font-bold text-foreground mt-4">Financeiro</h4>
      <DetailItem
        label="Pagamento"
        value={
          <Badge variant={user.pagamentoEfetuado ? "default" : "destructive"}>
            {user.pagamentoEfetuado ? "Efetuado" : "Pendente"}
          </Badge>
        }
      />
      <DetailItem
        label="Data do Pagamento"
        value={
          user.dataPagamento
            ? format(new Date(user.dataPagamento), "dd/MM/yyyy 'às' HH:mm", {
                locale: ptBR,
              })
            : null
        }
      />
    </div>
  );
}

// Dados Acadêmicos ou Médicos
function UserAcademicOrMedicalData({ user }: { user: User }) {
  const isEsttu = !!user.curso;

  return (
    <div className="space-y-4">
      {isEsttu ? (
        <>
          <h4 className="font-bold text-foreground">Dados Acadêmicos</h4>
          <DetailItem label="Instituição" value={user.instituicao} />
          <DetailItem label="Curso" value={user.curso} />
          <DetailItem label="Escolaridade" value={user.escolaridade} />
          <DetailItem label="Ano de Renovação" value={user.anoParaRenovacao} />
        </>
      ) : (
        <>
          <h4 className="font-bold text-foreground">Dados Médicos</h4>
          <DetailItem label="CID" value={user.cid} />
          <DetailItem label="Classe" value={user.classe} />
          <DetailItem label="Tipo Sanguíneo" value={user.tipoSanguineo} />
          <DetailItem label="Nome da Mãe" value={user.nomeMae} />
          <DetailItem label="Nome do Pai" value={user.nomePai} />
        </>
      )}
    </div>
  );
}

export function UserDetailsRow({ user }: { user: User }) {
  return (
    <div className="p-4 bg-muted rounded-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <UserDocuments user={user} />
        <UserPersonalData user={user} />
        <UserAcademicOrMedicalData user={user} />
        <UserAddressAndFinance user={user} />
      </div>
    </div>
  );
}
