// src/app/api/admin/route.ts

import { getSessionFromRequest } from "@/lib/auth/session";
import { adminCreateSchema } from "@/schemas/admin.schema";
import { AdminService } from "@/service/admin.service";
import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/handle-errors-utils";
import { AuthenticationError, ValidationError } from "@/errors/custom.errors";
import { z } from "zod";
import { APP_DATABASE_ADMIN } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    // 1. Autenticação e Autorização
    const session = await getSessionFromRequest(request);
    if (!session?.id || !session?.app) {
      // Lança um erro específico em vez de retornar a resposta diretamente.
      throw new AuthenticationError();
    }

    // 2. Validação do corpo da requisição
    const body = await request.json();
    const validation = adminCreateSchema.safeParse(body);

    if (!validation.success) {
      // Lança um erro de validação com os detalhes do Zod.
      throw new ValidationError(
        "Dados inválidos.",
        z.treeifyError(validation.error)
      );
    }

    // 3. Execução da Lógica de Negócio
    const adminService = new AdminService(APP_DATABASE_ADMIN);
    const newAdmin = await adminService.create(validation.data, session.id);

    // 4. Resposta de Sucesso
    return NextResponse.json(newAdmin, { status: 201 }); // Created
  } catch (error) {
    // 5. Tratamento Centralizado de Erros
    // Qualquer erro lançado no bloco 'try' será capturado aqui
    // e tratado de forma consistente pelo nosso utilitário.
    return handleRouteError(error);
  }
}

// Rota GET: listar todos os admins
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.id || !session?.app) {
      throw new AuthenticationError();
    }

    const adminService = new AdminService(APP_DATABASE_ADMIN);
    const admins = await adminService.findAll(); // Crie este método no service

    return NextResponse.json(admins);
  } catch (error) {
    return handleRouteError(error);
  }
}
