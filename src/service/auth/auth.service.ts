import { AdminRepository } from "@/repository/admin.repository";
import { SessionPayload, Tokens } from "@/types/sessions-type";
import { PasswordService } from "@/service/auth/password.service";
import { TokenService } from "@/service/auth/token.service";
import { APP } from "@/types/app.type";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { InvalidCredentialsError } from "@/errors/custom.errors";

export class AuthService {
  private adminRepository: AdminRepository;
  private passwordService: PasswordService;
  private tokenService: TokenService;

  constructor(app: APP) {
    const db = getFirebaseAdmin(app);
    this.adminRepository = new AdminRepository(db);
    this.passwordService = new PasswordService();
    this.tokenService = new TokenService();
  }

  /**
   * @summary Handles the login process for an admin user.
   * @param email {string} The admin's email.
   * @param password {string} The admin's password.
   * @returns {Promise<Tokens | null>} Returns generated access and refresh tokens if successful.
   * @throws {InvalidCredentialsError} If the email or password is incorrect.
   */
  async login(email: string, password: string): Promise<Tokens | null> {
    const admin = await this.adminRepository.getByEmail(email);

    if (!admin) {
      throw new InvalidCredentialsError("Invalid email or password.");
    }

    const isPasswordValid = await this.passwordService.compare(
      password,
      admin.password
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsError("Invalid email or password.");
    }

    const payload: SessionPayload = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      app: admin.app,
    };

    return this.tokenService.generateTokens(payload);
  }

  /**
   * @summary Verifies a token without needing to instantiate the full AuthService.
   * @param token {string | undefined} The JWT token to verify.
   * @returns {Promise<SessionPayload | null>} Returns the decoded session payload if valid, otherwise null.
   */
  static async verifyToken(
    token: string | undefined
  ): Promise<SessionPayload | null> {
    if (!token) return null;

    const tokenService = new TokenService();
    return tokenService.verifyToken(token);
  }
}
