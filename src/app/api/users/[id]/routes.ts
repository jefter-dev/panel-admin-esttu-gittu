/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Busca um usuário por seu ID
 *     description: >
 *       Retorna os dados de um usuário específico com base no seu ID (UUID).
 *       Requer autenticação de um administrador ou de um usuário com permissão.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: O ID (UUID) do usuário a ser buscado.
 *         schema:
 *           type: string
 *           format: uuid
 *         example: "d4a7c1b8-2a7e-4b9f-8d1a-3e5f7c9b2d6e"
 *     responses:
 *       '200':
 *         description: Usuário encontrado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   example: "d4a7c1b8-2a7e-4b9f-8d1a-3e5f7c9b2d6e"
 *                 idDocument:
 *                   type: string
 *                   example: "AbCdeFg12345HiJk"
 *                 nome:
 *                   type: string
 *                   example: "João"
 *                 sobrenome:
 *                   type: string
 *                   example: "da Silva"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "joao.silva@example.com"
 *                 celular:
 *                   type: string
 *                   example: "11987654321"
 *                 cpf:
 *                   type: string
 *                   example: "12345678901"
 *                 # ... e todos os outros campos do usuário, exceto 'senha'
 *
 *       '401':
 *         description: Não autorizado. O token de autenticação é inválido ou não foi fornecido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Sessão inválida ou token expirado."
 *
 *       '404':
 *         description: Usuário não encontrado. O ID fornecido não corresponde a nenhum usuário no sistema.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Usuário com ID d4a7c1b8-2a7e-4b9f-8d1a-3e5f7c9b2d6e não encontrado."
 *
 *       '500':
 *         description: Erro interno do servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ocorreu um erro interno no servidor."
 */

import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/service/user.service";
import { AuthService } from "@/service/auth/auth.service"; // Para autenticação/autorização
import { handleRouteError } from "@/lib/handle-errors-utils";
import {
  AuthenticationError,
  RecordNotFoundError,
  ValidationError,
} from "@/errors/custom.errors";
import { APP } from "@/types/app";
import { isValidAppName } from "@/lib/auth/session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Autenticação: Garante que a requisição é de um usuário/admin logado.
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

    // 2. Autorização (Opcional, mas recomendado):
    // Decide quem pode ver os dados de quem.
    // Exemplo: um usuário comum só pode ver seus próprios dados, mas um admin pode ver qualquer um.
    const { id } = await params;

    // 3. Execução da Lógica de Negócio
    // Usamos o 'app' da sessão do requisitante para instanciar o serviço
    const userService = new UserService(appDataBase);
    const user = await userService.findById(id);

    // 4. Tratamento do Caso "Não Encontrado"
    if (!user) {
      // Lançamos um erro específico que será traduzido para 404 pelo handleRouteError
      throw new RecordNotFoundError(`Usuário com ID ${id} não encontrado.`);
    }

    // 5. Resposta de Sucesso
    // Removemos o hash da senha antes de enviar a resposta
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    // 6. Tratamento Centralizado de Erros
    return handleRouteError(error);
  }
}
