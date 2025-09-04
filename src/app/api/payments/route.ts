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

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Create a new payment
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Payment'
 *     responses:
 *       201:
 *         description: Payment successfully created
 *       400:
 *         description: Invalid payment data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid payment data."
 *       401:
 *         description: Unauthorized (invalid webhook token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized request."
 *       500:
 *         description: Internal server error while creating payment
 */

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: List payments
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 15
 *         description: Maximum number of payments to return
 *       - in: query
 *         name: startAfter
 *         schema:
 *           type: string
 *         description: ID of the last document from previous page (for pagination)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by customer name or CPF
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Start date of the range (YYYY-MM-DD)
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: End date of the range (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: List of payments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 payments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
 *                 hasNextPage:
 *                   type: boolean
 *                   description: Indicates if there are more results
 *       400:
 *         description: Missing or invalid date range
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Parameters 'dateFrom' and 'dateTo' are required."
 *       401:
 *         description: Unauthorized (invalid or expired token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid session or expired token."
 *       500:
 *         description: Internal server error while listing payments
 */

export async function POST(request: NextRequest) {
  try {
    const webhookToken = request.headers.get("x-asaas-webhook-token");

    WebhookAuthService.validateToken(webhookToken, "asaas");

    const body = await request.json();
    const validation = paymentCreateSchema.safeParse(body);

    if (!validation.success) {
      throw new ValidationError(
        "Invalid payment data.",
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
      throw new AuthenticationError("Invalid session or expired token.");
    }

    const appSession: APP = session.app;
    if (!isValidAppName(appSession)) {
      throw new ValidationError("Session not found or incorrectly defined.");
    }

    const { searchParams } = request.nextUrl;
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const startAfter = searchParams.get("startAfter") || undefined;
    const search = searchParams.get("search") || undefined;
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    if (!dateFrom || !dateTo) {
      throw new ValidationError(
        "Parameters 'dateFrom' and 'dateTo' are required."
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
