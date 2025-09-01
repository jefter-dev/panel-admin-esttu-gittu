import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/service/payment.service";
import { paymentCreateSchema } from "@/schemas/payment.schema";
import { handleRouteError } from "@/lib/handle-errors-utils";
import { ValidationError } from "@/errors/custom.errors";
import z from "zod";
import { APP_DATABASE_ADMIN } from "@/lib/firebase-admin";
import { WebhookAuthService } from "@/service/auth/webhook-auth.service";

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

    const paymentService = new PaymentService(APP_DATABASE_ADMIN);

    const payments = await paymentService.list({
      limit,
      startAfter,
      search,
      dateFrom,
      dateTo,
    });

    const hasNextPage = payments.length > limit;

    return NextResponse.json(
      { payments: payments.slice(0, limit), hasNextPage },
      { status: 200 }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
