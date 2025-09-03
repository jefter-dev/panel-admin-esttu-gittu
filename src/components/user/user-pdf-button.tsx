"use client";

import { jsPDF } from "jspdf";
import { User } from "@/types/user.type";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import { FileDown } from "lucide-react";
import { toast } from "sonner";

// Normaliza nome do arquivo
const slugify = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .toLowerCase();

interface UserPdfProps {
  user: User;
  logoUrl?: string; // logo da empresa
}

// Função para buscar imagem via proxy e retornar DataURL
const fetchImageProxy = async (url: string): Promise<string | null> => {
  try {
    const res = await fetch("/api/download-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export function UserPdfButton({ user, logoUrl }: UserPdfProps) {
  const generatePdf = async () => {
    const toastId = toast.loading("Gerando PDF...");
    const doc = new jsPDF();
    const pageHeight = 297; // A4 mm
    let y = 20;

    // ================= PÁGINA 1: INFORMAÇÕES =================
    if (logoUrl) {
      const logoImg = await fetchImageProxy(logoUrl);
      if (logoImg) doc.addImage(logoImg, "PNG", 20, 10, 30, 30);
    }

    if (user.fotoIdentificacao) {
      const fotoImg = await fetchImageProxy(user.fotoIdentificacao);
      if (fotoImg) doc.addImage(fotoImg, "JPEG", 160, 10, 30, 30);
    }

    y = 50;
    doc.setFontSize(18);
    doc.text("Ficha do Usuário", 105, y, { align: "center" });
    y += 15;

    const addTableSection = (
      title: string,
      fields: Record<string, string | number | boolean | null | undefined>
    ) => {
      if (y + 20 > pageHeight - 20) {
        doc.setFontSize(10);
        doc.text(
          `Gerado em: ${new Date().toLocaleString()}`,
          20,
          pageHeight - 10
        );
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(14);
      doc.text(title, 20, y);
      y += 8;

      doc.setFontSize(11);
      Object.entries(fields).forEach(([label, value]) => {
        if (!value) return;
        if (y + 6 > pageHeight - 20) {
          doc.setFontSize(10);
          doc.text(
            `Gerado em: ${new Date().toLocaleString()}`,
            20,
            pageHeight - 10
          );
          doc.addPage();
          y = 20;
        }
        doc.text(`${label}: ${value}`, 25, y);
        y += 6;
      });

      y += 5;
    };

    // ================= DADOS PESSOAIS =================
    addTableSection("Dados Pessoais", {
      ID: user.id,
      Nome: `${user.nome} ${user.sobrenome}`,
      Email: user.email,
      Celular: user.celular,
      CPF: user.cpf,
      RG: user.rg,
      "Data de Nascimento": user.dataNascimento,
      "Pagamento Efetuado": user.pagamentoEfetuado ? "Sim" : "Não",
      "Data do Pagamento": formatDateTime(user.dataPagamento),
      "Primeiro Acesso": user.isNotFirstTime ? "Já acessou" : "Primeiro acesso",
    });

    // ================= INFORMAÇÕES ACADÊMICAS =================
    addTableSection("Informações Acadêmicas (ESTTU)", {
      Curso: user.curso,
      Escolaridade: user.escolaridade,
      Instituição: user.instituicao,
      "Ano Renovação": user.anoParaRenovacao,
      Classe: user.classe,
    });

    // ================= ENDEREÇO =================
    addTableSection("Endereço", {
      Endereço: `${user.endereco ?? ""}, ${user.numero ?? ""}`,
      Complemento: user.complemento,
      CEP: user.cep,
      Cidade: user.cidade,
      Estado: user.estado,
    });

    // ================= DADOS DE SAÚDE (GITTU) =================
    if (user.cid) {
      addTableSection("Dados de Saúde (GITTU)", {
        CID: user.cid,
        "Nome da Mãe": user.nomeMae,
        "Nome do Pai": user.nomePai,
        "Tipo Sanguíneo": user.tipoSanguineo,
      });
    }

    // Rodapé página 1
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 20, pageHeight - 10);

    // ================= PÁGINA 2: DOCUMENTOS IMAGENS =================
    doc.addPage();
    y = 20;

    const documentImages: Record<string, string | null | undefined> = {
      "Documento Matrícula": user.documentMatricula,
      "Documento com Foto": user.documentoComFoto,
      "Laudo Diagnóstico": user.documentDiagnostico,
    };

    for (const [label, url] of Object.entries(documentImages)) {
      if (!url) continue;
      const imgData = await fetchImageProxy(url);
      if (!imgData) continue;

      doc.setFontSize(12);
      doc.text(label, 105, y, { align: "center" });
      y += 5;

      const img = new Image();
      img.src = imgData;
      await new Promise((resolve) => (img.onload = resolve));

      const maxWidth = 170;
      const maxHeight = 250;
      let imgWidth = img.width;
      let imgHeight = img.height;

      if (imgWidth > maxWidth) {
        const ratio = maxWidth / imgWidth;
        imgWidth = maxWidth;
        imgHeight = imgHeight * ratio;
      }
      if (imgHeight > maxHeight) {
        const ratio = maxHeight / imgHeight;
        imgHeight = maxHeight;
        imgWidth = imgWidth * ratio;
      }

      const x = (210 - imgWidth) / 2;
      if (y + imgHeight > pageHeight - 20) {
        doc.setFontSize(10);
        doc.text(
          `Gerado em: ${new Date().toLocaleString()}`,
          20,
          pageHeight - 10
        );
        doc.addPage();
        y = 20;
      }

      doc.addImage(imgData, "JPEG", x, y, imgWidth, imgHeight);
      y += imgHeight + 10;
    }

    // Rodapé última página
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 20, pageHeight - 10);

    const filename = slugify(`${user.nome}_${user.sobrenome}_ficha`) + ".pdf";
    doc.save(filename);
    toast.success("PDF gerado com sucesso!", { id: toastId });
  };

  return (
    <Button
      className="cursor-pointer"
      variant={"outline"}
      onClick={generatePdf}
    >
      <FileDown className="mr-2 h-4 w-4" />
      Gerar PDF do usuário
    </Button>
  );
}
