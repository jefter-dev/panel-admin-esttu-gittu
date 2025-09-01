export const ALLOWED_PAYMENT_FILTERS = ["status", "method", "userId"] as const;
export type AllowedPaymentFilter = (typeof ALLOWED_PAYMENT_FILTERS)[number];
export type PaymentFilterType = AllowedPaymentFilter | "";
