import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/service/payment.service";
import { APP_DATABASE_ADMIN } from "@/lib/firebase-admin";
import { handleRouteError } from "@/lib/handle-errors-utils";
import { AuthenticationError, ValidationError } from "@/errors/custom.errors";
import { AuthService } from "@/service/auth/auth.service";
import { APP } from "@/types/app";
import { isValidAppName } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = request.nextUrl;
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    if (!dateFrom || !dateTo) {
      throw new ValidationError(
        "Os parâmetros 'dateFrom' e 'dateTo' são obrigatórios."
      );
    }

    const paymentService = new PaymentService(APP_DATABASE_ADMIN);

    const total = await paymentService.getTotalAmountByDateRange(
      appDataBase,
      dateFrom,
      dateTo
    );

    return NextResponse.json({ stats: { total } }, { status: 200 });
  } catch (error) {
    return handleRouteError(error);
  }
}
