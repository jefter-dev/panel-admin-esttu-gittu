/**
 * @file types/user.type.ts
 *
 * @summary Defines the unified User interface for the system, including all fields
 * for both 'esttu' and 'gittu' applications. Fields specific to each app are optional.
 */

/**
 * Represents a unified user in the system.
 */
export interface User {
  // ======================================================
  // COMMON FIELDS (Shared across all applications)
  // ======================================================

  /** Firestore document ID */
  idDocument: string;

  /** Universal unique ID (UUID) for the user */
  id: string;

  /** First name */
  nome: string;

  /** Last name */
  sobrenome: string;

  /** Email address */
  email: string;

  /** Mobile phone number */
  celular: string;

  /** CPF (Brazilian individual taxpayer registry) */
  cpf: string;

  /** RG (optional) */
  rg?: string | null | undefined;

  /** Birth date in "dd/mm/yyyy" format */
  dataNascimento: string;

  /** URL for user identification photo (selfie) */
  fotoIdentificacao?: string | null | undefined;

  /** Password hash (never sent to client) */
  senha: string;

  /** Indicates if the payment has been completed */
  pagamentoEfetuado?: boolean;

  /** Date and time of payment (ISO 8601) */
  dataPagamento?: string;

  /** Flag for onboarding/first access flow */
  isNotFirstTime?: boolean | null;

  // ======================================================
  // 'ESTTU' SPECIFIC FIELDS
  // ======================================================

  /** Residential address */
  endereco?: string;

  /** Address number */
  numero?: string;

  /** Address complement (apartment, block, etc.) */
  complemento?: string | null;

  /** Postal code (CEP) */
  cep?: string;

  /** City */
  cidade?: string;

  /** State (UF) */
  estado?: string;

  /** Student course */
  curso?: string;

  /** Student education level */
  escolaridade?: string;

  /** Educational institution */
  instituicao?: string;

  /** Year for card renewal */
  anoParaRenovacao?: string;

  /** URL for enrollment document */
  documentMatricula?: string | null;

  /** URL for ID document with photo */
  documentoComFoto?: string | null;

  // ======================================================
  // 'GITTU' SPECIFIC FIELDS
  // ======================================================

  /** CID code (diagnosis) */
  cid?: string;

  /** Class or group */
  classe?: string;

  /** URL for diagnostic document */
  documentDiagnostico?: string;

  /** Mother's full name */
  nomeMae?: string;

  /** Father's full name */
  nomePai?: string;

  /** Blood type (e.g., "A+", "O-") */
  tipoSanguineo?: string;
}

/** Payload for creating a new user (excluding IDs and 'cid') */
export type UserCreatePayload = Omit<User, "cid" | "id" | "idDocument">;

/** Payload for updating an existing user */
export type UserUpdatePayload = Partial<UserCreatePayload>;
