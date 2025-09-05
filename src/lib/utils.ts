/**
 * @file lib-utils.ts
 *
 * @summary Utility functions for class handling, API interactions, date/number formatting,
 * image downloads, canvas handling, and user-related helpers.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { apiClient } from "@/lib/http-client";
import { PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS } from "@/lib/navigation";
import { User } from "@/types/user.type";
import { toast } from "sonner";

/**
 * Merges and resolves Tailwind CSS class strings.
 * Combines `clsx` and `twMerge` for conditional class merging.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Determines the best page title based on the current pathname.
 * @param pathname Current browser pathname
 * @returns The label of the matching navigation item or fallback "Painel"
 */
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

/**
 * Downloads an image from a given URL via the API and triggers a browser download.
 * @param url Image URL to download
 * @param filename Desired file name for the download
 */
export async function handleDownloadImage(url: string, filename: string) {
  try {
    const response = await apiClient.post(
      "/download-image",
      { url },
      { responseType: "blob" }
    );

    const blob = response.data;
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch {
    toast.error("Failed to download the image.");
  }
}

/**
 * Generates a URL for a user's QR code depending on their type (Esttu or other).
 * @param user User object
 * @returns QR code URL
 */
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
  return isEsttu ? `${baseUrl}?user=${userEncoded}` : user.documentDiagnostico;
}

/**
 * Downloads a <canvas> element as a PNG image.
 * @param canvasId ID of the canvas element in the DOM
 * @param filename Desired file name without extension
 */
export function downloadCanvasAsPng(canvasId: string, filename: string) {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) return;

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `${filename}.png`;
  link.click();
}

/**
 * Checks if a string resembles an email.
 */
export const isEmail = (term: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(term);

/**
 * Validates whether a string is a valid CPF (Brazilian individual taxpayer registry).
 */
export const isCPF = (term: string): boolean => {
  const cleaned = term.replace(/[.\-]/g, "");
  return /^\d{11}$/.test(cleaned);
};

/**
 * Formats a string as a Brazilian CPF (XXX.XXX.XXX-XX).
 */
export const formatCPF = (cpf: string): string => {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return cpf;
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

/**
 * Formats an ISO date string into Brazilian datetime format (dd/MM/yyyy HH:mm).
 */
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

/**
 * Returns the start and end dates of a month in UTC.
 * @param date Optional reference date (default: today)
 */
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

/**
 * Formats a number as Brazilian currency.
 */
export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Parses a string date as a UTC Date object.
 * @param dateString Date string in format 'YYYY-MM-DD HH:mm:ss'
 */
export function parseDateAsUTC(dateString: string): Date {
  const [datePart, timePart] = dateString.split(" ");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes, seconds] = timePart.split(":").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
}

/**
 * Converts a given string into a URL-friendly slug.
 * - Removes accents and diacritics.
 * - Replaces non-alphanumeric characters with underscores.
 * - Converts the result to lowercase.
 *
 * @param text Input string to be transformed
 * @returns Slugified version of the input string
 */
export const slugify = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .toLowerCase();

/**
 * Fetches an image through a proxy API endpoint and converts it into a base64 string.
 * - Uses `/api/download-image` to avoid CORS issues.
 * - Returns `null` if the request fails.
 *
 * @param url Image URL to fetch
 * @returns A base64-encoded string of the image, or `null` if failed
 */
export const fetchImageProxy = async (url: string): Promise<string | null> => {
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

// utils/date.ts
export interface DateRangeDefault {
  from: Date;
  to: Date;
}

/**
 * Retorna um intervalo de datas padrão.
 * @param days {number} Número de dias anteriores até hoje (incluso hoje)
 * @returns {DateRangeDefault} Objeto com `from` e `to`
 */
export function getDefaultDateRange(days: number = 7): DateRangeDefault {
  const now = new Date();

  const to = new Date(now);
  to.setHours(23, 59, 59, 999);

  const from = new Date(now);
  from.setDate(from.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);

  return { from, to };
}

/**
 * Tenta parsear uma string para Date, caso inválida retorna o default fornecido
 * @param dateStr {string | null}
 * @param defaultDate {Date}
 * @returns {Date}
 */
export function parseDateOrDefault(
  dateStr: string | null,
  defaultDate: Date
): Date {
  if (!dateStr) return defaultDate;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? defaultDate : date;
}
