import { WebhookError } from "@/errors/custom.errors";

/**
 * @summary Service for validating webhook tokens from external providers.
 */
export class WebhookAuthService {
  /** @summary Stores provider-specific webhook secrets. */
  static tokens: Record<string, string> = {
    asaas: process.env.ASAAS_WEBHOOK_SECRET || "",
  };

  /**
   * @summary Validates a webhook token against the stored secret.
   * @param token {string | null} The token received in the webhook request.
   * @param provider {string} The webhook provider (default: "asaas").
   * @returns {boolean} Returns true if the token is valid.
   * @throws {WebhookError} If the secret is not configured or the token is invalid.
   */
  static validateToken(
    token: string | null,
    provider: string = "asaas"
  ): boolean {
    const secret = this.tokens[provider];

    if (!secret) {
      throw new WebhookError(
        `Webhook token not configured for ${provider}. Check environment variable.`
      );
    }

    if (!token || token !== secret) {
      throw new WebhookError(`Webhook ${provider} not authorized.`);
    }

    return true;
  }
}
