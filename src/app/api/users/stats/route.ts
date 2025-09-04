import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/service/auth/auth.service";
import { handleRouteError } from "@/lib/handle-errors-utils";
import { isValidAppName } from "@/lib/auth/session";
import { AuthenticationError, ValidationError } from "@/errors/custom.errors";
import { APP } from "@/types/app.type";
import { UserService } from "@/service/user.service";

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Get general user statistics
 *     description: >
 *       Returns statistics about users, including the total number of users and the number of confirmed payments.
 *       Requires authentication of an admin.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User statistics retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     paymentsConfirmed:
 *                       type: integer
 *                       description: Number of confirmed payments.
 *                       example: 120
 *                     totalUsers:
 *                       type: integer
 *                       description: Total number of users.
 *                       example: 450
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

export async function GET(request: NextRequest) {
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

    const userService = new UserService(appDataBase);
    const [paymentsConfirmed, totalUsers] = await Promise.all([
      userService.countPaymentsConfirmed(),
      userService.countTotalUsers(),
    ]);

    return NextResponse.json(
      { stats: { paymentsConfirmed, totalUsers } },
      { status: 200 }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
