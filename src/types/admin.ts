// src/types/admin.ts

import { APP } from "@/types/app";

export enum Role {
  USER = "user",
  ADMIN = "admin",
}

export type Admin = {
  id: string;
  email: string;
  password: string; // Hash da senha
  name: string;
  role: Role;
  adminRegister: string; // ID do admin que registrou
  adminUpdated: string; // ID do admin que atualizou por último
  createAt: string; // Data em formato ISO (ex: "2023-10-27T10:00:00.000Z")
  updateAt: string; // Data em formato ISO
  app: APP;
};

// Payload para CRIAR um novo admin
export type AdminCreationRequest = {
  name: string;
  email: string;
  password: string;
  role: Role;
  app?: APP;
};

// Payload que será salvo no banco. O serviço adiciona os metadados.
export type AdminCreatePayload = Omit<Admin, "id">;

// Payload para ATUALIZAR um admin.
export type AdminUpdatePayload = Partial<
  Omit<Admin, "id" | "createAt" | "adminRegister">
>;
