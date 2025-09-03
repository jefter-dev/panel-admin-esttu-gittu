/**
 * @swagger
 * /api/users/{userId}/payments:
 *   get:
 *     summary: Lista os pagamentos de um usuário específico
 *     description: >
 *       Retorna uma lista de todos os registros de pagamento associados a um determinado ID de usuário (UUID).
 *       Requer autenticação de um administrador ou do próprio usuário.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: O ID (UUID) do usuário cujos pagamentos serão listados.
 *         schema:
 *           type: string
 *           format: uuid
 *         example: "d4a7c1b8-2a7e-4b9f-8d1a-3e5f7c9b2d6e"
 *     responses:
 *       '200':
 *         description: Lista de pagamentos retornada com sucesso. A lista pode estar vazia se o usuário não tiver pagamentos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                     description: ID único do registro de pagamento.
 *                     example: "f4b3c2a1-1a2b-3c4d-5e6f-7g8h9i0j1k2l"
 *                   userId:
 *                     type: string
 *                     format: uuid
 *                     description: ID do usuário que realizou o pagamento.
 *                     example: "d4a7c1b8-2a7e-4b9f-8d1a-3e5f7c9b2d6e"
 *                   gatewayPaymentId:
 *                     type: string
 *                     description: ID do pagamento no gateway externo ex. Asaas.
 *                     example: "pay_1234567890abcd"
 *                   amount:
 *                     type: integer
 *                     description: Valor do pagamento em centavos.
 *                     example: 5000
 *                   method:
 *                     type: string
 *                     description: O método de pagamento utilizado.
 *                     enum:
 *                       - CREDIT_CARD
 *                       - PIX
 *                       - BOLETO
 *                     example: "CREDIT_CARD"
 *                   status:
 *                     type: string
 *                     description: O status atual do pagamento.
 *                     enum:
 *                       - CONFIRMED
 *                       - PENDING
 *                       - FAILED
 *                       - REFUNDED
 *                     example: "CONFIRMED"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Data e hora em que o registro foi criado (formato ISO 8601).
 *                     example: "2023-10-27T14:30:00Z"
 *                   app:
 *                     type: string
 *                     description: A qual aplicação este pagamento pertence.
 *                     example: "esttu"
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
 *         description: Usuário não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Usuário não encontrado."
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
import { AuthService } from "@/service/auth/auth.service";
import { PaymentService } from "@/service/payment.service";
import { handleRouteError } from "@/lib/handle-errors-utils";
import { AuthenticationError, ValidationError } from "@/errors/custom.errors";
import { APP } from "@/types/app.type";
import { isValidAppName } from "@/lib/auth/session";

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

    const { id } = await params;

    // 3. Execução da Lógica de Negócio
    const paymentService = new PaymentService(appDataBase);
    const payments = await paymentService.getPaymentsForUser(id);

    // 4. Resposta de Sucesso
    return NextResponse.json(payments, { status: 200 });
  } catch (error) {
    // 5. Tratamento Centralizado de Erros
    return handleRouteError(error);
  }
}
