import "server-only";
import { compare, hash } from "bcryptjs";

/**
 * @summary Interface defining password hashing and comparison methods.
 */
export interface IPasswordService {
  /**
   * @summary Compares a plain text password with a hashed password.
   * @param plainText {string} The plain text password.
   * @param hashed {string} The hashed password to compare against.
   * @returns {Promise<boolean>} True if the passwords match, false otherwise.
   */
  compare(plainText: string, hashed: string): Promise<boolean>;

  /**
   * @summary Hashes a plain text password.
   * @param plainText {string} The plain text password.
   * @returns {Promise<string>} The hashed password.
   */
  hash(plainText: string): Promise<string>;
}

/**
 * @summary Service for hashing and comparing passwords using bcryptjs.
 */
export class PasswordService implements IPasswordService {
  private readonly saltRounds = 10;

  /**
   * @summary Compares a plain text password with a hashed password.
   * @param plainText {string} The plain text password.
   * @param hashed {string} The hashed password to compare against.
   * @returns {Promise<boolean>} True if the passwords match, false otherwise.
   */
  async compare(plainText: string, hashed: string): Promise<boolean> {
    return compare(plainText, hashed);
  }

  /**
   * @summary Hashes a plain text password.
   * @param plainText {string} The plain text password.
   * @returns {Promise<string>} The hashed password.
   */
  async hash(plainText: string): Promise<string> {
    return hash(plainText, this.saltRounds);
  }
}
