/**
 * @file types/admin.ts
 *
 * @summary Defines types and enums for admin users, roles, and payloads
 * used in creating, updating, and storing admin records.
 */

import { APP } from "@/types/app.type";

/**
 * Enum for available admin/user roles.
 */
export enum Role {
  USER = "user",
  ADMIN = "admin",
}

/**
 * Represents an admin user stored in the database.
 */
export type Admin = {
  /** Unique identifier of the admin */
  id: string;

  /** Email of the admin */
  email: string;

  /** Password hash */
  password: string;

  /** Full name */
  name: string;

  /** Role of the admin */
  role: Role;

  /** ID of the admin who originally registered this admin */
  adminRegister: string;

  /** ID of the admin who last updated this admin */
  adminUpdated: string;

  /** ISO string for creation date (ex: "2023-10-27T10:00:00.000Z") */
  createAt: string;

  /** ISO string for last update date */
  updateAt: string;

  /** App context this admin belongs to */
  app: APP;

  /** Optional name of the registering admin */
  adminRegisterName?: string;

  /** Optional name of the last updating admin */
  adminUpdatedName?: string;
};

/**
 * Payload used when creating a new admin via API or service.
 */
export type AdminCreationRequest = {
  /** Full name */
  name: string;

  /** Email address */
  email: string;

  /** Password (plain text, to be hashed by service) */
  password: string;

  /** Role to assign */
  role: Role;

  /** Optional app context (default can be set by service) */
  app?: APP;
};

/**
 * Payload structure that is actually saved in the database.
 * Excludes the 'id' field, which is generated automatically.
 */
export type AdminCreatePayload = Omit<Admin, "id">;

/**
 * Payload used to update an existing admin.
 * Allows partial updates, excluding immutable fields:
 * - 'id'
 * - 'createAt'
 * - 'adminRegister'
 */
export type AdminUpdatePayload = Partial<
  Omit<Admin, "id" | "createAt" | "adminRegister">
>;
