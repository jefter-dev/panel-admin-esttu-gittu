import { AdminRepository } from "@/repository/admin.repository";
import { SessionPayload, Tokens } from "@/types/sessions";
import { PasswordService } from "./password.service";
import { TokenService } from "./token.service";
import { APP } from "@/types/app";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { InvalidCredentialsError } from "@/errors/custom.errors";

export class AuthService {
  // As dependências são privadas
  private adminRepository: AdminRepository;
  private passwordService: PasswordService;
  private tokenService: TokenService;

  constructor(app: APP) {
    // Instancia todas as dependências aqui dentro
    const db = getFirebaseAdmin(app);
    this.adminRepository = new AdminRepository(db);
    this.passwordService = new PasswordService();
    this.tokenService = new TokenService();
  }

  /**
   * Orquestra o processo de login.
   * A lógica interna agora é muito mais limpa e legível.
   */
  async login(email: string, password: string): Promise<Tokens | null> {
    const admin = await this.adminRepository.getByEmail(email);

    console.log("admin [LOGIN]: ", email, admin);

    if (!admin) {
      throw new InvalidCredentialsError("E-mail ou senha inválidos.");
    }

    const isPasswordValid = await this.passwordService.compare(
      password,
      admin.password
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsError("E-mail ou senha inválidos.");
    }

    const payload: SessionPayload = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      app: admin.app,
    };

    console.log("payload: ", payload);

    // Delega a criação do token
    return this.tokenService.generateTokens(payload);
  }

  /**
   * Expõe o método de verificação de token do TokenService.
   * Este método estático é um atalho conveniente para não precisar instanciar
   * o AuthService inteiro só para verificar um token.
   */
  static async verifyToken(
    token: string | undefined
  ): Promise<SessionPayload | null> {
    if (!token) return null;

    // Para manter o isolamento, ele cria sua própria instância temporária do TokenService.
    const tokenService = new TokenService();
    return tokenService.verifyToken(token);
  }
}
