import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  AuthenticationError,
  DataPersistenceError,
  DuplicateRecordError,
  RecordNotFoundError,
  ValidationError,
  InvalidCredentialsError,
  ConfigurationError,
} from "@/errors/custom.errors";

export const handleRouteError = (error: unknown): NextResponse => {
  if (error instanceof ValidationError) {
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: 400 }
    );
  }

  if (error instanceof ConfigurationError) {
    return NextResponse.json(
      { error: "Ocorreu um erro de configuração no servidor." },
      { status: 500 }
    );
  }

  if (error instanceof InvalidCredentialsError) {
    return NextResponse.json(
      { error: error.message || "E-mail ou senha inválidos." },
      { status: 401 } // Unauthorized
    );
  }

  if (error instanceof AuthenticationError) {
    return NextResponse.json(
      { error: error.message || "Não autenticado." },
      { status: 401 }
    );
  }

  if (error instanceof RecordNotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  if (error instanceof DuplicateRecordError) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }

  if (error instanceof DataPersistenceError) {
    console.error("[API_ERROR] Falha de persistência:", error.cause || error);
    return NextResponse.json(
      { error: "Ocorreu uma falha no servidor ao processar sua requisição." },
      { status: 500 }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Dados inválidos.", details: error.flatten() },
      { status: 400 }
    );
  }

  console.error("[API_ERROR] Erro inesperado:", error);
  return NextResponse.json(
    { error: "Ocorreu um erro interno inesperado." },
    { status: 500 }
  );
};
