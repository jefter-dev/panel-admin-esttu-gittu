import { getSessionFromRequest } from "@/lib/auth/session";
import { adminCreateSchema } from "@/schemas/admin.schema";
import { AdminService } from "@/service/admin.service";
import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/handle-errors-utils";
import { AuthenticationError, ValidationError } from "@/errors/custom.errors";
import { z } from "zod";
import { APP_DATABASE_ADMIN } from "@/lib/firebase-admin";

/**
 * @swagger
 * /api/admins:
 *   post:
 *     summary: Create a new administrator
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminCreate'
 *     responses:
 *       201:
 *         description: Administrator successfully created
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.id || !session?.app) {
      throw new AuthenticationError("Invalid session or expired token.");
    }

    const body = await request.json();
    const validation = adminCreateSchema.safeParse(body);

    if (!validation.success) {
      throw new ValidationError(
        "Invalid data.",
        z.treeifyError(validation.error)
      );
    }

    const adminService = new AdminService(APP_DATABASE_ADMIN);
    const newAdmin = await adminService.create(validation.data, session.id);

    return NextResponse.json(newAdmin, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

/**
 * @swagger
 * /api/admins:
 *   get:
 *     summary: List all administrators
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of administrators returned successfully
 *       401:
 *         description: Unauthorized or invalid token
 *       500:
 *         description: Internal server error
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.id || !session?.app) {
      throw new AuthenticationError("Invalid session or expired token.");
    }

    const adminService = new AdminService(APP_DATABASE_ADMIN);
    const admins = await adminService.findAll();

    return NextResponse.json(admins);
  } catch (error) {
    return handleRouteError(error);
  }
}
