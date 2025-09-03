import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/service/payment.service";
import { paymentCreateSchema } from "@/schemas/payment.schema";
import { handleRouteError } from "@/lib/handle-errors-utils";
import { AuthenticationError, ValidationError } from "@/errors/custom.errors";
import z from "zod";
import { APP_DATABASE_ADMIN } from "@/lib/firebase-admin";
import { WebhookAuthService } from "@/service/auth/webhook-auth.service";
import { AuthService } from "@/service/auth/auth.service";
import { isValidAppName } from "@/lib/auth/session";
import { APP } from "@/types/app.type";

export async function POST(request: NextRequest) {
  try {
    const webhookToken = request.headers.get("x-asaas-webhook-token");

    // Validação genérica
    WebhookAuthService.validateToken(webhookToken, "asaas");

    const body = await request.json();
    const validation = paymentCreateSchema.safeParse(body);

    if (!validation.success) {
      throw new ValidationError(
        "Dados do pagamento inválidos.",
        z.treeifyError(validation.error)
      );
    }

    const paymentService = new PaymentService(APP_DATABASE_ADMIN);
    const newPayment = await paymentService.createPayment(validation.data);

    return NextResponse.json(newPayment, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

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

    const { searchParams } = request.nextUrl;
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const startAfter = searchParams.get("startAfter") || undefined;
    const search = searchParams.get("search") || undefined;
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    if (!dateFrom || !dateTo) {
      throw new ValidationError(
        "Os parâmetros 'dateFrom' e 'dateTo' são obrigatórios."
      );
    }

    const queryLimit = limit + 1;

    const paymentService = new PaymentService(APP_DATABASE_ADMIN);
    const paymentsFind = await paymentService.list({
      limit: queryLimit,
      startAfter,
      search,
      dateFrom,
      dateTo,
      app: appSession,
    });

    const hasNextPage = paymentsFind.length > limit;
    const payments = hasNextPage ? paymentsFind.slice(0, limit) : paymentsFind;

    return NextResponse.json(
      { payments: payments.slice(0, limit), hasNextPage },
      { status: 200 }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
