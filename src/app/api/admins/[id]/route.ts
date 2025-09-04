import { NextRequest, NextResponse } from "next/server";
import { AdminService } from "@/service/admin.service";
import { AuthService } from "@/service/auth/auth.service";
import { adminUpdateSchema } from "@/schemas/admin.schema";
import { handleRouteError } from "@/lib/handle-errors-utils";
import { AuthenticationError, ValidationError } from "@/errors/custom.errors";
import { z } from "zod";
import { APP_DATABASE_ADMIN } from "@/lib/firebase-admin";

/**
 * @swagger
 * /api/admins/{id}:
 *   get:
 *     summary: Get an administrator by ID
 *     description: Returns a specific administrator's data based on their ID (UUID). Requires administrator authentication. The search scope is limited to the authenticated administrator's application ('app').
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID (UUID) of the administrator to fetch.
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Administrator found successfully.
 *       401:
 *         description: Unauthorized. Invalid or missing authentication token.
 *       404:
 *         description: Administrator not found. The provided ID does not match any administrator.
 *       500:
 *         description: Internal server error.
 *
 *   patch:
 *     summary: Update an existing administrator
 *     description: Partially updates an administrator's data based on their ID. It is possible to update fields such as name, email, password, and role. Administrator authentication is required.
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID (UUID) of the administrator to update.
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       description: The administrator fields to be updated. At least one field must be provided.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The new password. It will be stored as a hash.
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *     responses:
 *       200:
 *         description: Administrator updated successfully.
 *       400:
 *         description: Invalid request. The data provided in the request body is invalid or empty.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Administrator to be updated not found.
 *       409:
 *         description: Conflict. The new email provided is already in use by another administrator.
 *       500:
 *         description: Internal server error.
 *   delete:
 *     summary: Delete an administrator by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the administrator to delete
 *     responses:
 *       200:
 *         description: Administrator successfully deleted
 *       401:
 *         description: Unauthorized or invalid token
 *       404:
 *         description: Administrator not found
 *       500:
 *         description: Internal server error
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminService = new AdminService(APP_DATABASE_ADMIN);
    const { id } = await params;

    const admin = await adminService.findById(id);

    return NextResponse.json(admin, { status: 200 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AuthenticationError("Bearer token is missing or malformed.");
    }
    const token = authHeader.split(" ")[1];
    const session = await AuthService.verifyToken(token);
    if (!session?.id || !session?.app) {
      throw new AuthenticationError("Invalid session or expired token.");
    }

    const body = await request.json();
    const validation = adminUpdateSchema.safeParse(body);

    if (!validation.success) {
      throw new ValidationError(
        "Invalid data.",
        z.treeifyError(validation.error)
      );
    }

    if (Object.keys(validation.data).length === 0) {
      throw new ValidationError("Request body cannot be empty.");
    }

    const adminService = new AdminService(APP_DATABASE_ADMIN);

    const { id } = await params;

    await adminService.update(id, validation.data, session.id);

    return NextResponse.json(
      { message: "Administrator updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AuthenticationError("Bearer token is missing or malformed.");
    }
    const token = authHeader.split(" ")[1];
    const session = await AuthService.verifyToken(token);
    if (!session?.id || !session?.app) {
      throw new AuthenticationError("Invalid session or expired token.");
    }

    const { id } = await params;

    const adminService = new AdminService(APP_DATABASE_ADMIN);
    await adminService.delete(id);

    return NextResponse.json(
      { message: "Administrator successfully removed." },
      { status: 200 }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
