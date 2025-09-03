/**
 * Representa um usuário unificado no sistema, contendo todos os campos possíveis
 * das aplicações 'esttu' e 'gittu'. Campos específicos de cada aplicação são
 * marcados como opcionais para permitir flexibilidade.
 */
export interface User {
  // ======================================================
  // CAMPOS COMUNS (Compartilhados por todas as aplicações)
  // ======================================================

  /**
   * O ID do documento no Firestore.
   * @example "AbCdeFg12345HiJk"
   */
  idDocument: string;

  /**
   * O identificador único universal (UUID) do usuário.
   * @example "d4a7c1b8-2a7e-4b9f-8d1a-3e5f7c9b2d6e"
   */
  id: string;

  /**
   * O primeiro nome do usuário.
   * @example "João"
   */
  nome: string;

  /**
   * O sobrenome do usuário.
   * @example "da Silva"
   */
  sobrenome: string;

  /**
   * O endereço de e-mail do usuário, usado para login e comunicação.
   * @example "joao.silva@example.com"
   */
  email: string;

  /**
   * O número de telefone celular do usuário.
   * @example "11987654321"
   */
  celular: string;

  /**
   * O CPF (Cadastro de Pessoas Físicas) do usuário.
   * @example "12345678901"
   */
  cpf: string;

  /**
   * O número do RG (Registro Geral) do usuário.
   * @example "123456789"
   */
  rg?: string | null | undefined;

  /**
   * A data de nascimento do usuário no formato "dd/mm/aaaa".
   * @example "15/05/1998"
   */
  dataNascimento: string;

  /**
   * A URL para a foto de identificação (selfie) do usuário.
   * @example "https://example.com/fotos/selfie.jpg"
   */
  fotoIdentificacao?: string | null | undefined;

  /**
   * O hash da senha do usuário. **Este campo nunca deve ser enviado ao cliente.**
   */
  senha: string;

  /**
   * Indica se o pagamento da anuidade/taxa foi efetuado.
   * @optional
   */
  pagamentoEfetuado?: boolean;

  /**
   * A data e hora em que o pagamento foi realizado, em formato ISO 8601.
   * @optional
   * @example "2023-10-27T14:30:00Z"
   */
  dataPagamento?: string;

  /**
   * Flag para controlar fluxos de onboarding ou primeiro acesso.
   * @optional
   */
  isNotFirstTime?: boolean | null;

  // ======================================================
  // CAMPOS ESPECÍFICOS DA APLICAÇÃO 'ESTTU'
  // ======================================================

  /**
   * O endereço residencial do usuário (rua, avenida, etc.).
   * @optional Exclusivo para 'esttu'.
   */
  endereco?: string;

  /**
   * O número do endereço residencial.
   * @optional Exclusivo para 'esttu'.
   */
  numero?: string;

  /**
   * O complemento do endereço (apto, bloco, etc.).
   * @optional Exclusivo para 'esttu'.
   */
  complemento?: string | null;

  /**
   * O CEP (Código de Endereçamento Postal).
   * @optional Exclusivo para 'esttu'.
   */
  cep?: string;

  /**
   * A cidade de residência.
   * @optional Exclusivo para 'esttu'.
   */
  cidade?: string;

  /**
   * O estado (UF) de residência.
   * @optional Exclusivo para 'esttu'.
   */
  estado?: string;

  /**
   * O curso no qual o estudante está matriculado.
   * @optional Exclusivo para 'esttu'.
   */
  curso?: string;

  /**
   * O nível de escolaridade do estudante.
   * @optional Exclusivo para 'esttu'.
   */
  escolaridade?: string;

  /**
   * A instituição de ensino do estudante.
   * @optional Exclusivo para 'esttu'.
   */
  instituicao?: string;

  /**
   * O ano previsto para a renovação da carteirinha de estudante.
   * @optional Exclusivo para 'esttu'.
   */
  anoParaRenovacao?: string;

  /**
   * A URL para o documento de matrícula do estudante.
   * @optional Exclusivo para 'esttu'.
   */
  documentMatricula?: string | null;

  /**
   * A URL para um documento de identificação com foto (RG, CNH).
   * @optional Exclusivo para 'esttu'.
   */
  documentoComFoto?: string | null;

  // ======================================================
  // CAMPOS ESPECÍFICOS DA APLICAÇÃO 'GITTU'
  // ======================================================

  /**
   * O código CID (Classificação Internacional de Doenças) ou diagnóstico.
   * @optional Exclusivo para 'gittu'.
   */
  cid?: string;

  /**
   * A classe ou turma do usuário na instituição.
   * @optional Exclusivo para 'gittu'.
   */
  classe?: string;

  /**
   * A URL para o laudo ou documento de diagnóstico.
   * @optional Exclusivo para 'gittu'.
   */
  documentDiagnostico?: string;

  /**
   * O nome completo da mãe do usuário.
   * @optional Exclusivo para 'gittu'.
   */
  nomeMae?: string;

  /**
   * O nome completo do pai do usuário.
   * @optional Exclusivo para 'gittu'.
   */
  nomePai?: string;

  /**
   * O tipo sanguíneo do usuário (ex: "A+", "O-").
   * @optional Exclusivo para 'gittu'.
   */
  tipoSanguineo?: string;
}

/** Payload para criar um novo usuário no repositório. */
export type UserCreatePayload = Omit<User, "cid" | "id" | "idDocument">;

/** Payload para atualizar um usuário existente. */
export type UserUpdatePayload = Partial<UserCreatePayload>;
