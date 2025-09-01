import { NextRequest, NextResponse } from "next/server";
import { AdminService } from "@/service/admin.service";
import { AuthService } from "@/service/auth/auth.service";
import { adminUpdateSchema } from "@/schemas/admin.schema";
import { handleRouteError } from "@/lib/handle-errors-utils";
import { AuthenticationError, ValidationError } from "@/errors/custom.errors";
import { z } from "zod";
import { APP_DATABASE_ADMIN } from "@/lib/firebase-admin";

/**
 * @swagger
 * /api/admins/{id}:
 *   get:
 *     summary: Busca um administrador por seu ID
 *     description: >
 *       Retorna os dados de um administrador específico com base no seu ID (UUID).
 *       Requer autenticação de um administrador. O escopo da busca é limitado
 *       à aplicação ('app') do administrador autenticado.
 *     tags:
 *       - Admins
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: O ID (UUID) do administrador a ser buscado.
 *         schema:
 *           type: string
 *           format: uuid
 *         example: "634a0ff1-14a9-45e5-a52e-04839b7798d6"
 *     responses:
 *       '200':
 *         description: Administrador encontrado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   example: "634a0ff1-14a9-45e5-a52e-04839b7798d6"
 *                 name:
 *                   type: string
 *                   example: "Jefter Admin"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "admin@email.com"
 *                 role:
 *                   type: string
 *                   enum: [admin, user]
 *                   example: "admin"
 *                 app:
 *                   type: string
 *                   enum: [esttu, gittu]
 *                   example: "esttu"
 *                 createAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-10-27T10:00:00.000Z"
 *                 updateAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-10-28T14:30:00.000Z"
 *                 adminRegister:
 *                   type: string
 *                   format: uuid
 *                   example: "f8c3b1e0-2a7e-4b9f-8d1a-3e5f7c9b2d6e"
 *                 adminUpdated:
 *                   type: string
 *                   format: uuid
 *                   example: "f8c3b1e0-2a7e-4b9f-8d1a-3e5f7c9b2d6e"
 *
 *       '401':
 *         description: Não autorizado. O token de autenticação é inválido ou não foi fornecido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *       '404':
 *         description: Administrador não encontrado. O ID fornecido não corresponde a nenhum administrador.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *       '500':
 *         description: Erro interno do servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   patch:
 *     summary: Atualiza um administrador existente
 *     description: >
 *       Atualiza parcialmente os dados de um administrador com base no seu ID.
 *       É possível atualizar campos como nome, e-mail, senha e cargo.
 *       A autenticação de um administrador é necessária.
 *     tags:
 *       - Admins
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: O ID (UUID) do administrador a ser atualizado.
 *         schema:
 *           type: string
 *           format: uuid
 *         example: "634a0ff1-14a9-45e5-a52e-04839b7798d6"
 *     requestBody:
 *       required: true
 *       description: Os campos do administrador a serem atualizados. Pelo menos um campo deve ser fornecido.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Jefter S. Admin"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jefter.admin.novo@email.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: A nova senha. Será armazenada como hash.
 *                 example: "NovaSenha@123"
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *                 example: "admin"
 *     responses:
 *       '200':
 *         description: Administrador atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Administrador atualizado com sucesso."
 *
 *       '400':
 *         description: Requisição inválida. Os dados fornecidos no corpo da requisição são inválidos ou estão vazios.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *       '401':
 *         description: Não autorizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *       '404':
 *         description: Administrador a ser atualizado não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *       '409':
 *         description: Conflito. O novo e-mail fornecido já está em uso por outro administrador.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *       '500':
 *         description: Erro interno do servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 2. Lógica de Negócio
    // Instancia o serviço com o 'app' da sessão para garantir que um admin
    // de uma aplicação não possa ver dados de outra.
    const adminService = new AdminService(APP_DATABASE_ADMIN);
    const { id } = await params;

    // Busca o administrador no banco de dados.
    // O serviço deve lançar um RecordNotFoundError se não encontrar,
    // que será tratado pelo handleRouteError.
    const admin = await adminService.findById(id);
    console.log("ADMIN: ", admin);

    // 4. Resposta de Sucesso
    // Retorna os dados do administrador (sem a senha) com status 200 OK.
    return NextResponse.json(admin, { status: 200 });
  } catch (error) {
    // 5. Tratamento Centralizado de Erros
    return handleRouteError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Autenticação e Autorização
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AuthenticationError("Token Bearer ausente ou malformado.");
    }
    const token = authHeader.split(" ")[1];
    const session = await AuthService.verifyToken(token);
    if (!session?.id || !session?.app) {
      throw new AuthenticationError("Sessão inválida ou token expirado.");
    }

    // 2. Validação do Corpo da Requisição (usando o schema parcial)
    const body = await request.json();
    const validation = adminUpdateSchema.safeParse(body); // <--- Use o schema parcial

    if (!validation.success) {
      throw new ValidationError(
        "Dados inválidos.",
        z.treeifyError(validation.error)
      );
    }

    // Não prossiga se o corpo da requisição estiver vazio
    if (Object.keys(validation.data).length === 0) {
      throw new ValidationError("O corpo da requisição não pode estar vazio.");
    }

    // 3. Execução da Lógica de Negócio
    const adminService = new AdminService(APP_DATABASE_ADMIN); // <--- Use o 'app' da sessão

    const { id } = await params;

    // Passe o ID do admin que está realizando a ação
    await adminService.update(id, validation.data, session.id);

    // 4. Resposta de Sucesso
    // Para um PATCH/PUT, uma resposta 204 (No Content) é semanticamente correta,
    // mas 200 com uma mensagem também é muito comum.
    return NextResponse.json(
      { message: "Administrador atualizado com sucesso." },
      { status: 200 }
    );
  } catch (error) {
    // 5. Tratamento Centralizado de Erros
    // O handleRouteError já sabe o que fazer com RecordNotFoundError,
    // DuplicateRecordError, ValidationError, etc.
    return handleRouteError(error);
  }
}

// Rota DELETE para remover um admin
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Autenticação
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AuthenticationError("Token Bearer ausente ou malformado.");
    }
    const token = authHeader.split(" ")[1];
    const session = await AuthService.verifyToken(token);
    if (!session?.id || !session?.app) {
      throw new AuthenticationError("Sessão inválida ou token expirado.");
    }

    // 2. ID do admin a ser removido
    const { id } = await params;

    // 3. Executa a remoção usando o serviço
    const adminService = new AdminService(APP_DATABASE_ADMIN);
    await adminService.delete(id); // session.id: quem está removendo

    // 4. Retorna sucesso
    return NextResponse.json(
      { message: `Administrador removido com sucesso.` },
      { status: 200 }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
