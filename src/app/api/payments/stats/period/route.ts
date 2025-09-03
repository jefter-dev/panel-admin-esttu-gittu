import { AuthenticationError, ValidationError } from "@/errors/custom.errors";
import { isValidAppName } from "@/lib/auth/session";
import { APP_DATABASE_ADMIN } from "@/lib/firebase-admin";
import { handleRouteError } from "@/lib/handle-errors-utils";
import { AuthService } from "@/service/auth/auth.service";
import { PaymentService } from "@/service/payment.service";
import { APP } from "@/types/app.type";
import { NextRequest, NextResponse } from "next/server";

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

    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const paymentService = new PaymentService(APP_DATABASE_ADMIN);

    let payments;
    if (dateFrom && dateTo) {
      payments = await paymentService.getPaymentsByDateRange(
        appSession,
        dateFrom,
        dateTo
      );
    } else {
      payments = await paymentService.getPaymentsCurrentMonth(appSession);
    }

    return NextResponse.json({ stats: { payments } }, { status: 200 });
  } catch (error) {
    return handleRouteError(error);
  }
}
