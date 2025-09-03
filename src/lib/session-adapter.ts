/**
 * SessionAdapter.ts
 *
 * This file defines the SessionAdapter class, which is responsible for managing
 * authentication tokens in browser cookies. It provides methods to save, retrieve,
 * update, and clear tokens securely, with support for environment-specific cookie
 * configurations (e.g., secure and sameSite settings for production).
 */
import { Tokens } from "@/types/sessions-type";
import Cookies from "js-cookie";

interface CookieOptions {
  expires?: number | Date;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

export class SessionAdapter {
  private static readonly STORAGE_KEY = "auth_tokens";

  static async saveTokens(tokens: Tokens): Promise<void> {
    if (typeof window !== "undefined") {
      const isProduction = process.env.NODE_ENV === "production";

      const expiresInDays = tokens.expires_in / (60 * 60 * 24);

      console.log("expiresInDays: ", expiresInDays);

      const options: CookieOptions = {
        expires: expiresInDays,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
      };

      Cookies.set(this.STORAGE_KEY, JSON.stringify(tokens), options);
    }
  }

  static async getAccessToken(): Promise<string | null> {
    if (typeof window !== "undefined") {
      const tokensJson = Cookies.get(this.STORAGE_KEY);
      if (tokensJson) {
        try {
          const tokens: Tokens = JSON.parse(tokensJson);
          return tokens.access_token || null;
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error("Error get token from cookie:", error);
          }
          return null;
        }
      }
    }
    return null;
  }

  static async clearTokens(): Promise<void> {
    if (typeof window !== "undefined") {
      Cookies.remove(this.STORAGE_KEY);
    }
  }

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
            console.error("Error updating access_token:", error);
          }
        }
      }
    }
  }
}
