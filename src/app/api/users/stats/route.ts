import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/service/auth/auth.service";
import { handleRouteError } from "@/lib/handle-errors-utils";
import { isValidAppName } from "@/lib/auth/session";
import { AuthenticationError, ValidationError } from "@/errors/custom.errors";
import { APP } from "@/types/app.type";
import { UserService } from "@/service/user.service";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const session = await AuthService.verifyToken(token);
    if (!session?.id || !session?.app) {
      throw new AuthenticationError("Sessão inválida ou token expirado.");
    }

    const appDataBase: APP = session.app;
    if (!isValidAppName(appDataBase)) {
      throw new ValidationError(
        "Sessão não foi encontrada ou foi mal definida."
      );
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
