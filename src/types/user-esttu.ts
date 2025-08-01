/**
 * Represents a user with personal, contact, academic, and identification information.
 */
export interface User {
  /** Identification document number */
  idDocument: string;

  /** Unique user ID */
  id: string;

  /** First name */
  nome: string;

  /** Last name */
  sobrenome: string;

  /** Email address */
  email: string;

  /** Mobile phone number */
  celular: string;

  /** CPF (Brazilian individual taxpayer registry identification) */
  cpf: string;

  /** RG (Brazilian identity card number) */
  rg: string;

  /** Date of birth in format dd/mm/yyyy */
  dataNascimento: string;

  /** Address */
  endereco: string;

  /** Address number */
  numero: string;

  /** Optional address complement */
  complemento?: string;

  /** Postal code */
  cep: string;

  /** City */
  cidade: string;

  /** State */
  estado: string;

  /** Course enrolled */
  curso: string;

  /** Education level */
  escolaridade: string;

  /** Institution name */
  instituicao: string;

  /** Year for renewal */
  anoParaRenovacao: string;

  /** URL to enrollment document */
  documentMatricula: string;

  /** URL to identification document with photo */
  documentoComFoto: string;

  /** URL to identification photo */
  fotoIdentificacao: string;

  /** Password */
  senha: string;

  /** Indicates if user is not a first-time user (optional) */
  isNotFirstTime?: boolean | null;

  /** payment completed flag (optional) */
  pagamentoEfetuado?: boolean;

  /** data payment (optional) */
  dataPagamento?: string;
}