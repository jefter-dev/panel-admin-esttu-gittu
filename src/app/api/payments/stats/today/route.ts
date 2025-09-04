import { NextResponse } from "next/server";
import { PaymentService } from "@/service/payment.service";
import { APP } from "@/types/app.type";
import { AuthService } from "@/service/auth/auth.service";
import { AuthenticationError, ValidationError } from "@/errors/custom.errors";
import { isValidAppName } from "@/lib/auth/session";
import { APP_DATABASE_ADMIN } from "@/lib/firebase-admin";
import { handleRouteError } from "@/lib/handle-errors-utils";

/**
 * @swagger
 * /api/payments/summary/today:
 *   get:
 *     summary: Get today's payment summary
 *     tags: [Payments]
 *     description: >
 *       Retrieves a summary of all payments for the current application session for today.
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
 *         description: Payment summary for today retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   description: Summary statistics of today's payments
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
 *         description: Internal server error while fetching today's payment summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error while fetching today's payment summary."
 */

export async function GET(request: Request) {
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

    const service = new PaymentService(APP_DATABASE_ADMIN);
    const stats = await service.getPaymentsSummaryToday(appSession);

    return NextResponse.json({ stats }, { status: 200 });
  } catch (error) {
    console.error("Error fetching today's payment summary:", error);
    return handleRouteError(error);
  }
}
