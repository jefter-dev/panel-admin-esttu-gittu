import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/service/payment.service";
import { AuthService } from "@/service/auth/auth.service";
import { handleRouteError } from "@/lib/handle-errors-utils";
import { isValidAppName } from "@/lib/auth/session";
import { APP } from "@/types/app.type";
import { AuthenticationError, ValidationError } from "@/errors/custom.errors";
import { APP_DATABASE_ADMIN } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
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

    const paymentService = new PaymentService(APP_DATABASE_ADMIN);
    const paymentsCurrentMonth = await paymentService.getPaymentsCurrentMonth(
      appSession
    );

    return NextResponse.json(
      { stats: { payments: paymentsCurrentMonth } },
      { status: 200 }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
