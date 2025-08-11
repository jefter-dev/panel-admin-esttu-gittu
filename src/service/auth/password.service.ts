import "server-only";
import { compare, hash } from "bcryptjs";

export interface IPasswordService {
  compare(plainText: string, hashed: string): Promise<boolean>;
  hash(plainText: string): Promise<string>;
}

export class PasswordService implements IPasswordService {
  private readonly saltRounds = 10;

  async compare(plainText: string, hashed: string): Promise<boolean> {
    return compare(plainText, hashed);
  }

  async hash(plainText: string): Promise<string> {
    return hash(plainText, this.saltRounds);
  }
}
