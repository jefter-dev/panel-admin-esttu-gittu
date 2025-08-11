/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Busca uma lista paginada e filtrada de usuários
 *     description: >
 *       Retorna uma lista de usuários com suporte para paginação baseada em cursor e filtros
 *       por nome e status de pagamento. Requer autenticação de administrador.
 *       O escopo da busca é limitado à aplicação ('app') do administrador autenticado.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 15
 *         description: O número de usuários a serem retornados por página.
 *       - in: query
 *         name: startAfter
 *         schema:
 *           type: string
 *         description: O cursor para a próxima página (o 'nome' do último usuário da página anterior).
 *       - in: query
 *         name: pagamentoEfetuado
 *         schema:
 *           type: boolean
 *         description: Filtra usuários por status de pagamento (true ou false). Se não fornecido, busca todos.
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         description: Filtra usuários cujo nome começa com o valor fornecido (case-insensitive).
 *     responses:
 *       '200':
 *         description: Lista de usuários retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       nome:
 *                         type: string
 *                 hasNextPage:
 *                   type: boolean
 *                   description: Indica se há mais páginas de resultados disponíveis.
 *       '401':
 *         description: Não autorizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Erro interno do servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   post:
 *     summary: Cria um novo usuário
 *     description: >
 *       Registra um novo usuário no sistema. Esta rota requer autenticação de um administrador.
 *       O e-mail e o CPF devem ser únicos.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreate'
 *     responses:
 *       '201':
 *         description: Usuário criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '400':
 *         description: Dados de entrada inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Não autorizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '409':
 *         description: Conflito de dados (e-mail ou CPF já existe).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Erro interno do servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AuthService } from "@/service/auth/auth.service";
import { userCreateSchema } from "@/schemas/user.schema";
import { handleRouteError } from "@/lib/handle-errors-utils";
import { isValidAppName } from "@/lib/auth/session";
import { AuthenticationError, ValidationError } from "@/errors/custom.errors";
import { APP } from "@/types/app";
import { UserService } from "@/service/user.service";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const session = await AuthService.verifyToken(token);
    if (!session?.id || !session?.app) {
      throw new AuthenticationError("Sessão inválida ou token expirado.");
    }

    const { searchParams } = request.nextUrl;
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const startAfter = searchParams.get("startAfter") || undefined;
    const nome = searchParams.get("nome") || undefined;

    let pagamentoEfetuado: boolean | undefined;
    if (searchParams.has("pagamentoEfetuado")) {
      pagamentoEfetuado = searchParams.get("pagamentoEfetuado") === "true";
    }

    const appDataBase: APP = session.app;
    if (!isValidAppName(appDataBase)) {
      throw new ValidationError(
        "Sessão não foi encontrada ou foi mal definida."
      );
    }

    const queryLimit = limit + 1;

    const userService = new UserService(appDataBase);
    const usersWithExtra = await userService.list({
      limit: queryLimit,
      startAfterName: startAfter,
      pagamentoEfetuado: pagamentoEfetuado,
      nome: nome,
    });

    const hasNextPage = usersWithExtra.length > limit;
    const users = hasNextPage ? usersWithExtra.slice(0, limit) : usersWithExtra;

    return NextResponse.json({ users, hasNextPage }, { status: 200 });
  } catch (error) {
    return handleRouteError(error);
  }
}

// Esta rota será usada para criar novos usuários
export async function POST(request: NextRequest) {
  try {
    // 1. Determinar a qual 'app' este usuário pertence.
    // Pode vir de um header, de uma variável de ambiente, ou ser fixo.
    // Vamos assumir que é fixo por enquanto.
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

    // 2. Validação do Corpo da Requisição
    const body = await request.json();
    const validation = userCreateSchema.safeParse(body);
    if (!validation.success) {
      throw new ValidationError(
        "Dados de cadastro inválidos.",
        z.treeifyError(validation.error)
      );
    }

    // 3. Execução da Lógica de Negócio
    const userService = new UserService(appDataBase);
    const newUser = await userService.create(validation.data);

    // 4. Resposta de Sucesso
    // newUser já vem sem a senha, conforme definido no service.
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    // 5. Tratamento Centralizado de Erros
    // handleRouteError já sabe lidar com DuplicateRecordError (CPF/email já existe)
    // e DataPersistenceError.
    return handleRouteError(error);
  }
}
