import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/service/auth/auth.service";
import { PaymentService } from "@/service/payment.service";
import { handleRouteError } from "@/lib/handle-errors-utils";
import { AuthenticationError, ValidationError } from "@/errors/custom.errors";
import { APP } from "@/types/app.type";
import { isValidAppName } from "@/lib/auth/session";

/**
 * @swagger
 * /api/users/{userId}/payments:
 *   get:
 *     summary: List all payments for a specific user
 *     description: >
 *       Returns a list of all payment records associated with a specific user ID (UUID).
 *       Requires authentication of an admin or the user themselves.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID (UUID) of the user whose payments will be listed.
 *         schema:
 *           type: string
 *           format: uuid
 *         example: "d4a7c1b8-2a7e-4b9f-8d1a-3e5f7c9b2d6e"
 *     responses:
 *       '200':
 *         description: Payments list returned successfully. List may be empty if user has no payments.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                     description: Unique ID of the payment record.
 *                     example: "f4b3c2a1-1a2b-3c4d-5e6f-7g8h9i0j1k2l"
 *                   userId:
 *                     type: string
 *                     format: uuid
 *                     description: ID of the user who made the payment.
 *                     example: "d4a7c1b8-2a7e-4b9f-8d1a-3e5f7c9b2d6e"
 *                   gatewayPaymentId:
 *                     type: string
 *                     description: Payment ID in the external gateway (e.g., Asaas).
 *                     example: "pay_1234567890abcd"
 *                   amount:
 *                     type: integer
 *                     description: Payment amount in cents.
 *                     example: 5000
 *                   method:
 *                     type: string
 *                     description: Payment method used.
 *                     enum:
 *                       - CREDIT_CARD
 *                       - PIX
 *                       - BOLETO
 *                     example: "CREDIT_CARD"
 *                   status:
 *                     type: string
 *                     description: Current payment status.
 *                     enum:
 *                       - CONFIRMED
 *                       - PENDING
 *                       - FAILED
 *                       - REFUNDED
 *                     example: "CONFIRMED"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Date and time when the record was created (ISO 8601 format).
 *                     example: "2023-10-27T14:30:00Z"
 *                   app:
 *                     type: string
 *                     description: Application to which this payment belongs.
 *                     example: "esttu"
 *       '401':
 *         description: Unauthorized. Authentication token is invalid or missing.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid session or expired token."
 *       '404':
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found."
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An internal server error occurred."
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const session = await AuthService.verifyToken(token);
    if (!session?.id || !session?.app) {
      throw new AuthenticationError("Invalid session or expired token.");
    }

    const appDataBase: APP = session.app;
    if (!isValidAppName(appDataBase)) {
      throw new ValidationError("Session not found or improperly defined.");
    }

    const { id } = await params;

    const paymentService = new PaymentService(appDataBase);
    const payments = await paymentService.getPaymentsForUser(id);

    return NextResponse.json(payments, { status: 200 });
  } catch (error) {
    return handleRouteError(error);
  }
}
