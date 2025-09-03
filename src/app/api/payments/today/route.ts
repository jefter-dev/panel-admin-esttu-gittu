import { NextResponse } from "next/server";
import { PaymentService } from "@/service/payment.service";
import { APP_DATABASE_ADMIN } from "@/lib/firebase-admin";
import { AuthService } from "@/service/auth/auth.service";
import { isValidAppName } from "@/lib/auth/session";
import { handleRouteError } from "@/lib/handle-errors-utils";
import { AuthenticationError, ValidationError } from "@/errors/custom.errors";

export async function GET(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const session = await AuthService.verifyToken(token);

    if (!session?.id || !session?.app) {
      throw new AuthenticationError("Sessão inválida ou token expirado.");
    }

    const appSession = session.app;
    if (!isValidAppName(appSession)) {
      throw new ValidationError(
        "Sessão não foi encontrada ou foi mal definida."
      );
    }

    const service = new PaymentService(APP_DATABASE_ADMIN);
    const payments = await service.getPaymentsToday(appSession);

    return NextResponse.json({ payments }, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar listagem de pagamentos do dia:", error);
    return handleRouteError(error);
  }
}
