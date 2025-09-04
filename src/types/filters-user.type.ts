/**
 * @file types/filters-user.type.ts
 *
 * @summary Defines allowed filters and corresponding types for user queries.
 */

/**
 * List of valid user filter keys.
 */
export const ALLOWED_FILTER_TYPES = [
  "cpf",
  "rg",
  "telefone",
  "instituicao",
  "curso",
  "cidade",
  "estado",
] as const;

/**
 * Type representing a valid user filter key.
 */
export type AllowedFilterType = (typeof ALLOWED_FILTER_TYPES)[number];

/**
 * Type representing a filter key for users.
 * Can be a valid filter key or an empty string (no filter).
 */
export type FilterType = AllowedFilterType | "";

/**
 * Type representing a value for filtering users.
 * Can be a string, undefined, or empty string.
 */
export type FilterValue = string | undefined | "";

/**
 * Type representing payment filter options for users.
 * - "all" => all users
 * - "true" => users with payment completed
 * - "false" => users without payment
 */
export type FilterPayment = "all" | "true" | "false";
