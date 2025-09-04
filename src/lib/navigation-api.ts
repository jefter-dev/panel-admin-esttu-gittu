/**
 * @summary List of API paths that do not require authentication.
 * @description Requests to these paths can be accessed publicly without a valid session or token.
 */
export const publicPaths = [
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/payments",
];
