/**
 * @file types/filters-payment.type.ts
 *
 * @summary Defines allowed filters for payment queries and corresponding types.
 */

/**
 * List of valid filter keys for payments.
 */
export const ALLOWED_PAYMENT_FILTERS = ["status", "method", "userId"] as const;

/**
 * Type representing a valid payment filter key.
 * Can only be one of the values in ALLOWED_PAYMENT_FILTERS.
 */
export type AllowedPaymentFilter = (typeof ALLOWED_PAYMENT_FILTERS)[number];

/**
 * Type representing a filter key for payments.
 * Can be a valid filter key or an empty string (no filter).
 */
export type PaymentFilterType = AllowedPaymentFilter | "";
