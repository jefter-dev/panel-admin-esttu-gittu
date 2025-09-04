import { NextResponse } from "next/server";
import { PaymentService } from "@/service/payment.service";
import { APP_DATABASE_ADMIN } from "@/lib/firebase-admin";
import { AuthService } from "@/service/auth/auth.service";
import { isValidAppName } from "@/lib/auth/session";
import { handleRouteError } from "@/lib/handle-errors-utils";
import { AuthenticationError, ValidationError } from "@/errors/custom.errors";

/**
 * @swagger
 * /api/payments/today:
 *   get:
 *     summary: Get today's payments
 *     tags: [Payments]
 *     description: >
 *       Retrieves all payments registered today for the current application session.
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
 *         description: List of today's payments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 payments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
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
 *         description: Internal server error while fetching today's payments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error while fetching today's payments."
 */

export async function GET(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const session = await AuthService.verifyToken(token);

    if (!session?.id || !session?.app) {
      throw new AuthenticationError("Invalid session or expired token.");
    }

    const appSession = session.app;
    if (!isValidAppName(appSession)) {
      throw new ValidationError("Session not found or incorrectly defined.");
    }

    const service = new PaymentService(APP_DATABASE_ADMIN);
    const payments = await service.getPaymentsToday(appSession);

    return NextResponse.json({ payments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching today's payments list:", error);
    return handleRouteError(error);
  }
}
