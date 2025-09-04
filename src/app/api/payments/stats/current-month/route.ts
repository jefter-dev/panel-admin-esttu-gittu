import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/service/payment.service";
import { AuthService } from "@/service/auth/auth.service";
import { handleRouteError } from "@/lib/handle-errors-utils";
import { isValidAppName } from "@/lib/auth/session";
import { APP } from "@/types/app.type";
import { AuthenticationError, ValidationError } from "@/errors/custom.errors";
import { APP_DATABASE_ADMIN } from "@/lib/firebase-admin";

/**
 * @swagger
 * /api/payments/current-month/list:
 *   get:
 *     summary: Get all payments for the current month
 *     tags: [Payments]
 *     description: >
 *       Retrieves a list of all payments made in the current month for the authorized app.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer your_jwt_token_here"
 *         description: Bearer token to authorize the request
 *     responses:
 *       200:
 *         description: Payments of the current month retrieved successfully
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
 *                       description: List of payments for the current month
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
 *         description: Internal server error while fetching payments for the current month
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error while fetching current month payments."
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
