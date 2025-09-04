import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/service/user.service";
import { AuthService } from "@/service/auth/auth.service";
import { userUpdateSchema } from "@/schemas/user.schema";
import { handleRouteError } from "@/lib/handle-errors-utils";
import {
  AuthenticationError,
  ValidationError,
  RecordNotFoundError,
} from "@/errors/custom.errors";
import { APP } from "@/types/app.type";
import { isValidAppName } from "@/lib/auth/session";
import { z } from "zod";

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by documentId
 *     tags: [User]
 *     description: >
 *       Returns a specific user's data based on their documentId.
 *       Requires authentication as an admin or the user themselves.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The user's documentId to fetch.
 *         schema:
 *           type: string
 *         example: "AbCdeFg12345HiJk"
 *     responses:
 *       200:
 *         description: User found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
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
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User with documentId AbCdeFg12345HiJk not found."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error."
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
    const userService = new UserService(appDataBase);
    const user = await userService.findByDocumentId(id);

    if (!user) {
      throw new RecordNotFoundError(`User with documentId ${id} not found.`);
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return handleRouteError(error);
  }
}

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update a user by documentId
 *     tags: [User]
 *     description: >
 *       Updates a user's information based on their documentId.
 *       Requires authentication as an admin or the user themselves.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The user's documentId to update
 *         schema:
 *           type: string
 *         example: "AbCdeFg12345HiJk"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdateInput'
 *     responses:
 *       200:
 *         description: User successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User updated successfully."
 *       400:
 *         description: Invalid request body or empty payload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Request body cannot be empty."
 *       401:
 *         description: Unauthorized or insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No permission to update this user."
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User to update not found."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error."
 */

export async function PATCH(
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

    const body = await request.json();
    const validation = userUpdateSchema.safeParse(body);
    if (!validation.success) {
      throw new ValidationError(
        "Invalid data.",
        z.treeifyError(validation.error)
      );
    }
    if (Object.keys(validation.data).length === 0) {
      throw new ValidationError("Request body cannot be empty.");
    }

    const { id } = await params;
    const userService = new UserService(appDataBase);

    if (session.role !== "admin" && session.idDocument !== id) {
      throw new AuthenticationError("No permission to update this user.");
    }

    await userService.updateByDocumentId(id, validation.data);

    return NextResponse.json(
      { message: "User updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
