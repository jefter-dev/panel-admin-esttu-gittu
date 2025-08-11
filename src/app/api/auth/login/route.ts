/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Autentica um administrador e retorna tokens de acesso
 *     description: >
 *       Recebe um e-mail e uma senha, valida as credenciais contra o banco de dados
 *       de administradores e, se bem-sucedido, retorna um par de tokens JWT
 *       (Access Token e Refresh Token).
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       description: Credenciais de login do administrador.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: O e-mail do administrador.
 *                 example: "admin@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: A senha do administrador.
 *                 example: "senhaSuperSecreta123"
 *     responses:
 *       '200':
 *         description: Autenticação bem-sucedida. Retorna os tokens de acesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: Token de curta duração para autorizar requisições.
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
 *                 refreshToken:
 *                   type: string
 *                   description: Token de longa duração para obter um novo accessToken.
 *                   example: "def50200f419f396a8497c2c1b4b7b6c53545b6c..."
 *
 *       '400':
 *         description: Dados de entrada inválidos. O e-mail ou a senha não foram fornecidos ou estão em formato incorreto.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Dados inválidos."
 *
 *       '401':
 *         description: Credenciais inválidas. O e-mail não existe ou a senha está incorreta.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "E-mail ou senha inválidos."
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

import { loginSchema } from "@/schemas/login.schema";
import { AuthService } from "@/service/auth/auth.service";
import { ValidationError } from "@/errors/custom.errors";
import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/handle-errors-utils";
import { APP_DATABASE_ADMIN } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    // 1. Valida o corpo da requisição com o schema Zod
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      throw new ValidationError("Dados inválidos.");
    }

    const { email, password } = validation.data;

    // 3. Autentica o usuário
    const authService = new AuthService(APP_DATABASE_ADMIN);
    const tokens = await authService.login(email, password);

    // 4. Retorna os tokens ao frontend
    return NextResponse.json(tokens);
  } catch (error) {
    return handleRouteError(error);
  }
}
