import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/service/user.service";
import { AuthService } from "@/service/auth/auth.service";
import { userUpdateSchema } from "@/schemas/user.schema";
import { handleRouteError } from "@/lib/handle-errors-utils";
import {
  AuthenticationError,
  ValidationError,
  RecordNotFoundError,
} from "@/errors/custom.errors";
import { APP } from "@/types/app.type";
import { isValidAppName } from "@/lib/auth/session";
import { z } from "zod";

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Busca um usuário por seu documentId
 *     description: >
 *       Retorna os dados de um usuário específico com base no seu documentId.
 *       Requer autenticação de administrador ou do próprio usuário.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: O idDocument do usuário a ser buscado.
 *         schema:
 *           type: string
 *         example: "AbCdeFg12345HiJk"
 *     responses:
 *       '200':
 *         description: Usuário encontrado com sucesso.
 *       '401':
 *         description: Não autorizado.
 *       '404':
 *         description: Usuário não encontrado.
 *       '500':
 *         description: Erro interno do servidor.
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Autenticação
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const session = await AuthService.verifyToken(token);
    if (!session?.id || !session?.app) {
      throw new AuthenticationError("Sessão inválida ou token expirado.");
    }

    const appDataBase: APP = session.app;
    if (!isValidAppName(appDataBase)) {
      throw new ValidationError(
        "Sessão não foi encontrada ou foi mal definida."
      );
    }

    // 2. Busca usuário
    const { id } = await params;
    const userService = new UserService(appDataBase);
    const user = await userService.findByDocumentId(id);

    if (!user) {
      throw new RecordNotFoundError(
        `Usuário com idDocument ${id} não encontrado.`
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Autenticação
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const session = await AuthService.verifyToken(token);
    if (!session?.id || !session?.app) {
      throw new AuthenticationError("Sessão inválida ou token expirado.");
    }

    const appDataBase: APP = session.app;
    if (!isValidAppName(appDataBase)) {
      throw new ValidationError(
        "Sessão não foi encontrada ou foi mal definida."
      );
    }

    // 2. Validação body
    const body = await request.json();
    const validation = userUpdateSchema.safeParse(body);
    if (!validation.success) {
      throw new ValidationError(
        "Dados inválidos.",
        z.treeifyError(validation.error)
      );
    }
    if (Object.keys(validation.data).length === 0) {
      throw new ValidationError("O corpo da requisição não pode estar vazio.");
    }

    // 3. Execução
    const { id } = await params;
    const userService = new UserService(appDataBase);

    // ⚠️ Regra de autorização (se quiser restringir):
    // se não for admin, só pode atualizar o próprio user
    if (session.role !== "admin" && session.idDocument !== id) {
      throw new AuthenticationError(
        "Sem permissão para atualizar este usuário."
      );
    }

    await userService.updateByDocumentId(id, validation.data);

    return NextResponse.json(
      { message: "Usuário atualizado com sucesso." },
      { status: 200 }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
