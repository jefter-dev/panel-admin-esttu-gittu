/**
 * @file types/app.type.ts
 *
 * @summary Defines the available app contexts and the corresponding type.
 */

/**
 * List of valid app identifiers.
 */
export const APP_VALUES = ["esttu", "gittu", "admin"] as const;

/**
 * Type representing a valid app context.
 * Can only be one of the values in APP_VALUES.
 */
export type APP = (typeof APP_VALUES)[number];
