import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/service/payment.service";
import { APP_DATABASE_ADMIN } from "@/lib/firebase-admin";
import { handleRouteError } from "@/lib/handle-errors-utils";
import { AuthenticationError, ValidationError } from "@/errors/custom.errors";
import { AuthService } from "@/service/auth/auth.service";
import { APP } from "@/types/app.type";
import { isValidAppName } from "@/lib/auth/session";

/**
 * @swagger
 * /api/payments/stats:
 *   get:
 *     summary: Get total payments within a date range
 *     tags: [Payments]
 *     description: >
 *       Returns the total amount of payments for the current application session within a specified date range.
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
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-09-01"
 *         description: Start date of the range (YYYY-MM-DD)
 *       - in: query
 *         name: dateTo
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-09-03"
 *         description: End date of the range (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Total payment amount successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                       description: Total amount of payments in the specified range
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
 *         description: Unauthorized or invalid session/token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid session or expired token."
 *       500:
 *         description: Internal server error while fetching payment statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error while fetching payment statistics."
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

    const { searchParams } = request.nextUrl;
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    if (!dateFrom || !dateTo) {
      throw new ValidationError(
        "Parameters 'dateFrom' and 'dateTo' are required."
      );
    }

    const paymentService = new PaymentService(APP_DATABASE_ADMIN);

    const total = await paymentService.getTotalAmountByDateRange(
      appSession,
      dateFrom,
      dateTo
    );

    return NextResponse.json({ stats: { total } }, { status: 200 });
  } catch (error) {
    return handleRouteError(error);
  }
}
