import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { apiClient } from "@/lib/http-client";
import { PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS } from "@/lib/navigation";
import { User } from "@/types/user.type";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getPageTitle = (pathname: string): string => {
  let bestMatch: { label: string; hrefLength: number } | null = null;

  const allNavItems = [...PRIMARY_NAV_ITEMS, ...SECONDARY_NAV_ITEMS];

  for (const item of allNavItems) {
    if (pathname.startsWith(item.href)) {
      if (!bestMatch || item.href.length > bestMatch.hrefLength) {
        bestMatch = {
          label: item.label,
          hrefLength: item.href.length,
        };
      }
    }
  }

  return bestMatch ? bestMatch.label : "Painel";
};

export async function handleDownloadImage(url: string, filename: string) {
  try {
    // 2. Use apiClient.post em vez de fetch.
    // O primeiro argumento é a URL, o segundo é o corpo da requisição.
    const response = await apiClient.post(
      "/download-image", // A URL relativa à baseURL do seu cliente
      { url }, // O corpo da requisição (payload)
      {
        // 3. Esta é a parte crucial:
        // Dizemos ao Axios para tratar a resposta como um Blob, não como JSON.
        responseType: "blob",
      }
    );

    // 4. Com responseType: 'blob', os dados binários estão diretamente em 'response.data'.
    const blob = response.data;

    // O resto da lógica para criar o link de download permanece exatamente o mesmo.
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch {
    toast.error("Não foi possível baixar a imagem.");
  }
}

export function getUrlQrCode(user: User) {
  const isEsttu = !!user.curso;

  const qrCodePayload = isEsttu
    ? {
        id: user.id,
        nome: user.nome,
        sobrenome: user.sobrenome,
        cpf: user.cpf,
        dataNascimento: user.dataNascimento,
        curso: user.curso,
        instituicao: user.instituicao,
        anoParaRenovacao: user.anoParaRenovacao,
      }
    : {
        id: user.id,
        nome: user.nome,
        sobrenome: user.sobrenome,
        cpf: user.cpf,
        dataNascimento: user.dataNascimento,
        cid: user.cid,
        classe: user.classe,
        nomeMae: user.nomeMae,
        nomePai: user.nomePai,
        tipoSanguineo: user.tipoSanguineo,
      };
  const baseUrl = isEsttu ? "https://esttu-ec034.web.app/#/carteirinha" : "";

  const userEncoded = encodeURIComponent(JSON.stringify(qrCodePayload));
  const qrCodeUrl = isEsttu
    ? `${baseUrl}?user=${userEncoded}`
    : user.documentDiagnostico;

  return qrCodeUrl;
}

/**
 * Faz o download de um elemento canvas como imagem PNG.
 * @param canvasId ID do elemento <canvas> no DOM.
 * @param filename Nome do arquivo a ser baixado (sem extensão).
 */
export function downloadCanvasAsPng(canvasId: string, filename: string) {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) return;

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `${filename}.png`;
  link.click();
}

// Funções auxiliares para identificar o tipo de busca
export const isEmail = (term: string): boolean => {
  // Regex simples para verificar se parece um e-mail
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(term);
};

export const isCPF = (term: string): boolean => {
  // Verifica se o termo, após remover a formatação, contém apenas números e tem 11 dígitos
  const cleaned = term.replace(/[.\-]/g, "");
  return /^\d{11}$/.test(cleaned);
};

export const formatCPF = (cpf: string): string => {
  // Garante que estamos trabalhando com uma string limpa de 11 dígitos
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) {
    // Retorna o original se não for um CPF válido para formatação
    return cpf;
  }
  // Aplica a máscara XXX.XXX.XXX-XX
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

export const formatDateTime = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export function getStartAndEndOfMonthUTC(date: Date = new Date()): {
  start: Date;
  end: Date;
} {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();

  const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

  return { start, end };
}

export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function parseDateAsUTC(dateString: string): Date {
  const [datePart, timePart] = dateString.split(" ");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes, seconds] = timePart.split(":").map(Number);

  // Obs: mês é 0-indexado no JS Date
  return new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
}
