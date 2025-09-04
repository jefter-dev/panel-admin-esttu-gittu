import { AuthenticationError, ValidationError } from "@/errors/custom.errors";
import { isValidAppName } from "@/lib/auth/session";
import { APP_DATABASE_ADMIN } from "@/lib/firebase-admin";
import { handleRouteError } from "@/lib/handle-errors-utils";
import { AuthService } from "@/service/auth/auth.service";
import { PaymentService } from "@/service/payment.service";
import { APP } from "@/types/app.type";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/payments/range:
 *   get:
 *     summary: Get payments by date range or current month
 *     tags: [Payments]
 *     description: >
 *       Retrieves a list of payments for a specific date range if `dateFrom` and `dateTo` are provided,
 *       otherwise returns payments for the current month.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer your_jwt_token_here"
 *         description: Bearer token to authorize the request
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Start date of the range (YYYY-MM-DD)
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: End date of the range (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Payments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     payments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Payment'
 *       401:
 *         description: Unauthorized or invalid session/token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid session or expired token."
 *       400:
 *         description: Session not found or incorrectly defined
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Session not found or incorrectly defined."
 *       500:
 *         description: Internal server error while fetching payments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error while fetching payments."
 */

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
