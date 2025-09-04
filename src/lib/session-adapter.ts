/**
 * @file SessionAdapter.ts
 *
 * @summary Manages authentication tokens stored in browser cookies.
 * Provides methods to save, retrieve, update, and clear tokens securely.
 * Supports environment-specific cookie configurations (secure, sameSite).
 */

import { Tokens } from "@/types/sessions-type";
import Cookies from "js-cookie";

interface CookieOptions {
  expires?: number | Date;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

/**
 * @class SessionAdapter
 * @description Provides static methods to manage auth tokens in browser cookies.
 */
export class SessionAdapter {
  /** Key used for storing tokens in cookies */
  private static readonly STORAGE_KEY = "auth_tokens";

  /**
   * @summary Saves authentication tokens to browser cookies.
   * @param tokens Tokens object containing access_token, refresh_token, and expires_in.
   */
  static async saveTokens(tokens: Tokens): Promise<void> {
    if (typeof window !== "undefined") {
      const isProduction = process.env.NODE_ENV === "production";
      const expiresInDays = tokens.expires_in / (60 * 60 * 24); // Convert seconds to days

      const options: CookieOptions = {
        expires: expiresInDays,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
      };

      Cookies.set(this.STORAGE_KEY, JSON.stringify(tokens), options);
    }
  }

  /**
   * @summary Retrieves the access token from browser cookies.
   * @returns The access token string, or null if not found or parsing fails.
   */
  static async getAccessToken(): Promise<string | null> {
    if (typeof window !== "undefined") {
      const tokensJson = Cookies.get(this.STORAGE_KEY);
      if (tokensJson) {
        try {
          const tokens: Tokens = JSON.parse(tokensJson);
          return tokens.access_token || null;
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error("Error retrieving token from cookie:", error);
          }
          return null;
        }
      }
    }
    return null;
  }

  /**
   * @summary Clears authentication tokens from browser cookies.
   */
  static async clearTokens(): Promise<void> {
    if (typeof window !== "undefined") {
      Cookies.remove(this.STORAGE_KEY);
    }
  }

  /**
   * @summary Updates the access token stored in cookies while preserving other token data.
   * @param newAccessToken New access token string to be saved.
   */
  static async updateAccessToken(newAccessToken: string): Promise<void> {
    if (typeof window !== "undefined") {
      const tokensJson = Cookies.get(this.STORAGE_KEY);
      if (tokensJson) {
        try {
          const tokens: Tokens = JSON.parse(tokensJson);
          tokens.access_token = newAccessToken;
          await this.saveTokens(tokens);
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error("Error updating access token in cookie:", error);
          }
        }
      }
    }
  }
}
