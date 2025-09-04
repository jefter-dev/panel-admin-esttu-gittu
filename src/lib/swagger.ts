/**
 * @file swagger-docs.ts
 *
 * @summary Generates the Swagger/OpenAPI specification for the Next.js API.
 * Uses `next-swagger-doc` to automatically scan the `app/api` folder
 * and produce a structured OpenAPI spec.
 */

import { createSwaggerSpec } from "next-swagger-doc";

/**
 * @summary Generates the API documentation spec.
 * @returns A promise resolving to a Swagger/OpenAPI specification object.
 */
export const getApiDocs = async (): Promise<Record<string, unknown>> => {
  const spec = createSwaggerSpec({
    apiFolder: "app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Next Swagger - Panel admin esttu | gittu",
        version: "1.0",
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [],
    },
  });

  return spec as Record<string, unknown>;
};
