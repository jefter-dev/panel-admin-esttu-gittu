import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { SessionPayload, Tokens } from "@/types/sessions-type";
import ms, { StringValue } from "ms";
import { ConfigurationError } from "@/errors/custom.errors";

/**
 * @summary Interface defining methods for token generation and verification.
 */
export interface ITokenService {
  /**
   * @summary Generates access and refresh tokens for a given session payload.
   * @param payload {SessionPayload} The payload to encode in the JWT tokens.
   * @returns {Promise<Tokens>} Access and refresh tokens along with expiration info.
   */
  generateTokens(payload: SessionPayload): Promise<Tokens>;

  /**
   * @summary Verifies a JWT token and returns its decoded payload.
   * @param token {string} The JWT token to verify.
   * @returns {Promise<SessionPayload | null>} The decoded payload if valid, otherwise null.
   */
  verifyToken(token: string): Promise<SessionPayload | null>;
}

/**
 * @summary Parses a time duration environment variable using `ms` and returns milliseconds.
 * @param envVarName {string} Name of the environment variable.
 * @returns {number} Duration in milliseconds.
 * @throws {ConfigurationError} If the variable is missing or invalid.
 */
function parseMsEnvVar(envVarName: string): number {
  const value = process.env[envVarName];
  if (!value) {
    throw new ConfigurationError(
      `Environment variable ${envVarName} is not defined.`
    );
  }

  const msValue = ms(value as unknown as StringValue);
  if (typeof msValue !== "number" || isNaN(msValue) || msValue <= 0) {
    throw new ConfigurationError(
      `Environment variable ${envVarName} has invalid format: "${value}".`
    );
  }
  return msValue;
}

/**
 * @summary Service for generating and verifying JWT tokens.
 */
export class TokenService implements ITokenService {
  private readonly secretKey: Uint8Array;
  private readonly accessTokenExpiration: string;
  private readonly refreshTokenExpiration: string;
  private readonly accessTokenExpiresInSeconds: number;

  constructor() {
    if (!process.env.JWT_SECRET) {
      throw new ConfigurationError(
        "Environment variable JWT_SECRET is not defined."
      );
    }

    this.secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

    const accessTokenExp = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN;
    if (!accessTokenExp) {
      throw new ConfigurationError(
        "Environment variable JWT_ACCESS_TOKEN_EXPIRES_IN is not defined."
      );
    }
    this.accessTokenExpiration = accessTokenExp;

    const refreshTokenExp = process.env.JWT_REFRESH_TOKEN_EXPIRES_IN;
    if (!refreshTokenExp) {
      throw new ConfigurationError(
        "Environment variable JWT_REFRESH_TOKEN_EXPIRES_IN is not defined."
      );
    }
    this.refreshTokenExpiration = refreshTokenExp;

    const accessTokenMs = parseMsEnvVar("JWT_ACCESS_TOKEN_EXPIRES_IN");
    this.accessTokenExpiresInSeconds = Math.floor(accessTokenMs / 1000);
  }

  /**
   * @summary Generates access and refresh JWT tokens from a session payload.
   * @param payload {SessionPayload} The payload to encode.
   * @returns {Promise<Tokens>} Object containing access_token, refresh_token, and expires_in.
   */
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

  /**
   * @summary Verifies a JWT token and returns the decoded session payload.
   * @param token {string} The JWT token to verify.
   * @returns {Promise<SessionPayload | null>} The decoded payload if valid, otherwise null.
   */
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
