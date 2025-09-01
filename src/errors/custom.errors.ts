export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// Autenticação
export class InvalidCredentialsError extends AppError {
  constructor(message = "Credenciais inválidas.") {
    super(message, 401);
  }
}

export class UnauthorizedAccessError extends AppError {
  constructor(message = "Você não está autorizado a acessar este recurso.") {
    super(message, 401);
  }
}

export class ForbiddenActionError extends AppError {
  constructor(message = "Você não tem permissão para realizar esta ação.") {
    super(message, 403);
  }
}

export class TokenExpiredError extends AppError {
  constructor(message = "Token expirado. Faça login novamente.") {
    super(message, 401);
  }
}

// Validação
export class ValidationError extends Error {
  public details?: unknown;
  constructor(message: string, details?: unknown) {
    super(message);
    this.name = "ValidationError";
    this.details = details;
  }
}
// Persistência
export class DuplicateRecordError extends AppError {
  constructor(message = "Este registro já existe.") {
    super(message, 409);
  }
}

export class RecordNotFoundError extends AppError {
  constructor(message = "O registro solicitado não foi encontrado.") {
    super(message, 404);
  }
}

export class DataPersistenceError extends AppError {
  constructor(message = "Falha ao persistir os dados no banco.") {
    super(message, 500);
  }
}

// Casos específicos
export class EmailAlreadyUsedError extends AppError {
  constructor(message = "Este e-mail já está em uso.") {
    super(message, 409);
  }
}

// Erro para falhas de autenticação ou autorização.
export class AuthenticationError extends Error {
  constructor(message: string = "Sessão inválida ou não autorizada.") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

export class WebhookError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebhookError";
  }
}
