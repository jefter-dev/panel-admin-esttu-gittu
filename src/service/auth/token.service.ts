import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { SessionPayload, Tokens } from "@/types/sessions-type";
import ms, { StringValue } from "ms";
import { ConfigurationError } from "@/errors/custom.errors";

export interface ITokenService {
  generateTokens(payload: SessionPayload): Promise<Tokens>;
  verifyToken(token: string): Promise<SessionPayload | null>;
}

function parseMsEnvVar(envVarName: string): number {
  const value = process.env[envVarName];
  if (!value) {
    throw new ConfigurationError(
      `A variável de ambiente ${envVarName} não está definida.`
    );
  }

  const msValue = ms(value as unknown as StringValue);
  if (typeof msValue !== "number" || isNaN(msValue) || msValue <= 0) {
    throw new ConfigurationError(
      `A variável de ambiente ${envVarName} tem formato inválido: "${value}".`
    );
  }
  return msValue;
}

export class TokenService implements ITokenService {
  private readonly secretKey: Uint8Array;
  private readonly accessTokenExpiration: string;
  private readonly refreshTokenExpiration: string;
  private readonly accessTokenExpiresInSeconds: number;

  constructor() {
    if (!process.env.JWT_SECRET) {
      throw new ConfigurationError(
        "A variável de ambiente JWT_SECRET não está definida."
      );
    }

    this.secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

    const accessTokenExp = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN;
    if (!accessTokenExp) {
      throw new ConfigurationError(
        "A variável de ambiente JWT_ACCESS_TOKEN_EXPIRES_IN não está definida."
      );
    }
    this.accessTokenExpiration = accessTokenExp;

    const refreshTokenExp = process.env.JWT_REFRESH_TOKEN_EXPIRES_IN;
    if (!refreshTokenExp) {
      throw new ConfigurationError(
        "A variável de ambiente JWT_REFRESH_TOKEN_EXPIRES_IN não está definida."
      );
    }
    this.refreshTokenExpiration = refreshTokenExp;

    const accessTokenMs = parseMsEnvVar("JWT_ACCESS_TOKEN_EXPIRES_IN");
    this.accessTokenExpiresInSeconds = Math.floor(accessTokenMs / 1000);
  }

  async generateTokens(payload: SessionPayload): Promise<Tokens> {
    const { exp, iat, ...tokenPayload } = payload;
    void exp;
    void iat;

    const accessToken = await new SignJWT(tokenPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(this.accessTokenExpiration)
      .sign(this.secretKey);

    const refreshToken = await new SignJWT(tokenPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(this.refreshTokenExpiration)
      .sign(this.secretKey);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: this.accessTokenExpiresInSeconds,
    };
  }

  async verifyToken(token: string): Promise<SessionPayload | null> {
    try {
      const { payload } = await jwtVerify(token, this.secretKey, {
        algorithms: ["HS256"],
      });
      return payload as SessionPayload;
    } catch {
      return null;
    }
  }
}
