export const ALLOWED_FILTER_TYPES = [
  "cpf",
  "rg",
  "telefone",
  "instituicao",
  "curso",
  "cidade",
  "estado",
] as const;
export type AllowedFilterType = (typeof ALLOWED_FILTER_TYPES)[number];
export type FilterType = AllowedFilterType | "";
export type FilterValue = string | undefined | "";
export type FilterPayment = "all" | "true" | "false";
