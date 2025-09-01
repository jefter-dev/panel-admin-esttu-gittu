import { WebhookError } from "@/errors/custom.errors";

export class WebhookAuthService {
  static tokens: Record<string, string> = {
    asaas: process.env.ASAAS_WEBHOOK_SECRET || "",
  };

  static validateToken(
    token: string | null,
    provider: string = "asaas"
  ): boolean {
    const secret = this.tokens[provider];

    // 1. Variável de ambiente ausente
    if (!secret) {
      throw new WebhookError(
        `Token do webhook não configurado para ${provider}. Verifique a variável de ambiente.`
      );
    }

    // 2. Token inválido
    if (!token || token !== secret) {
      throw new WebhookError(`Webhook ${provider} não autorizado.`);
    }

    return true;
  }
}
