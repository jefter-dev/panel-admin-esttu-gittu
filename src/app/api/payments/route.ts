// src/app/api/payments/route.ts

import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/service/auth/auth.service";
import { PaymentService } from "@/service/payment.service";
import { paymentCreateSchema } from "@/schemas/payment.schema";
import { handleRouteError } from "@/lib/handle-errors-utils";
import { AuthenticationError, ValidationError } from "@/errors/custom.errors";

export async function POST(request: NextRequest) {
  try {
    // 1. Autenticação
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const session = await AuthService.verifyToken(token);
    if (!session?.id || !session?.app) {
      throw new AuthenticationError("Sessão inválida ou token expirado.");
    }

    // 2. Validação do Corpo da Requisição
    const body = await request.json();
    const validation = paymentCreateSchema.safeParse(body);
    if (!validation.success) {
      throw new ValidationError(
        "Dados do pagamento inválidos.",
        validation.error.flatten()
      );
    }

    // 3. Execução da Lógica de Negócio
    const paymentService = new PaymentService(session.app);
    const newPayment = await paymentService.createPayment(validation.data);

    // 4. Resposta de Sucesso
    return NextResponse.json(newPayment, { status: 201 });
  } catch (error) {
    // 5. Tratamento Centralizado de Erros
    return handleRouteError(error);
  }
}
