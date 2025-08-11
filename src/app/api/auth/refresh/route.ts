/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renova os tokens de acesso
 *     description: >
 *       Recebe um `refresh_token` válido e, se não estiver expirado ou revogado,
 *       retorna um novo par de `accessToken` e `refreshToken`.
 *       Isso permite que a sessão do usuário seja estendida sem a necessidade de um novo login.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       description: Objeto contendo o refresh token do usuário.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 description: O refresh token obtido durante o último login ou refresh.
 *                 example: "def50200f419f396a8497c2c1b4b7b6c53545b6c..."
 *     responses:
 *       '200':
 *         description: Autenticação renovada com sucesso. Retorna um novo par de tokens.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: O novo token de acesso de curta duração.
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ..."
 *                 refreshToken:
 *                   type: string
 *                   description: O novo refresh token (se a rotação de refresh tokens estiver habilitada).
 *                   example: "abc12300f419f396a8497c2c1b4b7b6c53545b6d..."
 *
 *       '400':
 *         description: Requisição malformada. O refresh token não foi fornecido no corpo da requisição.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Refresh token ausente."
 *
 *       '401':
 *         description: Não autorizado. O refresh token fornecido é inválido, expirou ou já foi utilizado (revogado).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Refresh token inválido ou expirado."
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
 *                   example: "Erro interno ao renovar token."
 */

import { NextRequest, NextResponse } from "next/server";
import { TokenService } from "@/service/auth/token.service";

export async function POST(request: NextRequest) {
  try {
    const { refresh_token } = await request.json();

    if (!refresh_token) {
      return NextResponse.json(
        { error: "Refresh token ausente." },
        { status: 400 }
      );
    }

    const tokenService = new TokenService();

    // 1. Verifica se o refresh token é válido e não expirou
    const session = await tokenService.verifyToken(refresh_token);
    if (!session) {
      return NextResponse.json(
        { error: "Refresh token inválido ou expirado." },
        { status: 401 }
      );
    }

    // 2. Gera novos tokens a partir do payload da sessão
    const tokens = await tokenService.generateTokens(session);

    // 3. Retorna os novos tokens para o cliente
    return NextResponse.json(tokens);
  } catch (error) {
    console.error("Erro ao renovar token:", error);
    return NextResponse.json(
      { error: "Erro interno ao renovar token." },
      { status: 500 }
    );
  }
}
