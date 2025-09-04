import { loginSchema } from "@/schemas/login.schema";
import { AuthService } from "@/service/auth/auth.service";
import { ValidationError } from "@/errors/custom.errors";
import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/handle-errors-utils";
import { APP_DATABASE_ADMIN } from "@/lib/firebase-admin";

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate a user and return access and refresh tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Tokens successfully generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                 refresh_token:
 *                   type: string
 *                 expires_in:
 *                   type: integer
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      throw new ValidationError("Invalid data.");
    }

    const { email, password } = validation.data;

    const authService = new AuthService(APP_DATABASE_ADMIN);
    const tokens = await authService.login(email, password);

    return NextResponse.json(tokens);
  } catch (error) {
    return handleRouteError(error);
  }
}
