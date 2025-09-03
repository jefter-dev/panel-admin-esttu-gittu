import { NextResponse } from "next/server";
import { PaymentService } from "@/service/payment.service";
import { APP } from "@/types/app.type";
import { AuthService } from "@/service/auth/auth.service";
import { AuthenticationError, ValidationError } from "@/errors/custom.errors";
import { isValidAppName } from "@/lib/auth/session";
import { APP_DATABASE_ADMIN } from "@/lib/firebase-admin";
import { handleRouteError } from "@/lib/handle-errors-utils";

export async function GET(request: Request) {
  try {
    // Recupera token Bearer
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const session = await AuthService.verifyToken(token);

    if (!session?.id || !session?.app) {
      throw new AuthenticationError("Sessão inválida ou token expirado.");
    }

    const appSession: APP = session.app;
    if (!isValidAppName(appSession)) {
      throw new ValidationError(
        "Sessão não foi encontrada ou foi mal definida."
      );
    }

    // Instancia o service
    const service = new PaymentService(APP_DATABASE_ADMIN);

    // Chama o método para o mês corrente
    const stats = await service.getPaymentsSummaryCurrentMonth(appSession);

    return NextResponse.json({ stats }, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar total de pagamentos do mês:", error);
    return handleRouteError(error);
  }
}
