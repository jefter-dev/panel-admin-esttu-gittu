
/**
 * Represents a user with identification, medical, and contact information.
 */
export interface User {
  /** Unique user document ID */
  idDocument: string;

  /** First name */
  nome: string;

  /** Last name */
  sobrenome: string;

  /** Email address */
  email: string;

  /** Mobile phone number (international or local format) */
  celular: string;

  /** CPF (Brazilian individual taxpayer registry identification) */
  cpf: string;

  /** RG (Brazilian identity card number) */
  rg: string;

  /** Date of birth in format dd/mm/yyyy */
  dataNascimento: string;

  /** ICD code or medical diagnosis reference */
  cid: string;

  /** Academic class or group */
  classe: string;

  /** URL to diagnostic document (e.g., medical report) */
  documentDiagnostico: string;

  /** URL to identification photo (face picture) */
  fotoIdentificacao: string;

  /** User's mother's name */
  nomeMae: string;

  /** User's father's name */
  nomePai: string;

  /** Blood type (optional) */
  tipoSanguineo: string;

  /** Password */
  senha: string;

  /** Indicates if user is not a first-time user (optional) */
  isNotFirstTime?: boolean | null;

  /** Street address (optional) */
  address?: string;

  /** Address number (optional) */
  addressNumber?: string | number;

  /** Postal code or ZIP code (optional) */
  postalCode?: string;

  /** Province, state, or region (optional) */
  province?: string;

  /** Additional contact phone number (optional) */
  phoneNumer?: string;

  /** Address complement, such as apartment or unit (optional) */
  complement?: string;

  /** City name or code (optional) */
  city?: number | string;

  /** payment completed flag (optional) */
  pagamentoEfetuado?: boolean;

  /** data payment (optional) */
  dataPagamento?: string;
}