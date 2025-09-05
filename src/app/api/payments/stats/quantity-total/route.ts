import { NextResponse } from "next/server";
import { PaymentService } from "@/service/payment.service";
import { APP_DATABASE_ADMIN } from "@/lib/firebase-admin";
import { handleRouteError } from "@/lib/handle-errors-utils";

/**
 * @swagger
 * /api/payments/stats:
 *   get:
 *     summary: Retrieve total payments within a date range
 *     tags:
 *       - Payments
 *     description: |
 *       Returns the total amount of payments for the current application session
 *       within a specified date range. Authorization via Bearer token is required.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token to authorize the request
 *         schema:
 *           type: string
 *           example: "Bearer your_jwt_token_here"
 *       - in: query
 *         name: dateFrom
 *         required: true
 *         description: Start date of the range in ISO 8601 format (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-09-01"
 *       - in: query
 *         name: dateTo
 *         required: true
 *         description: End date of the range in ISO 8601 format (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-09-03"
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
 *                       example: 12345.67
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

export async function GET() {
  try {
    const paymentService = new PaymentService(APP_DATABASE_ADMIN);

    const total = await paymentService.countTotalPayments();

    return NextResponse.json({ stats: { total } }, { status: 200 });
  } catch (error) {
    return handleRouteError(error);
  }
}
