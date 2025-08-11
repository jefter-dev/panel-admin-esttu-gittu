// src/service/payment.service.ts

import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { APP } from "@/types/app";
import { Payment, PaymentCreatePayload } from "@/types/payment";
import { PaymentCreateInput } from "@/schemas/payment.schema";
import { RecordNotFoundError } from "@/errors/custom.errors";
import { PaymentRepository } from "@/repository/payment.repository";
import { UserRepository } from "@/repository/user.repository";

export class PaymentService {
  private app: APP;
  private paymentRepository: PaymentRepository;
  private userRepository: UserRepository;

  constructor(app: APP) {
    const db = getFirebaseAdmin(app);
    this.app = app;
    this.paymentRepository = new PaymentRepository(db);
    this.userRepository = new UserRepository(db);
  }

  /**
   * Orquestra o registro de um novo pagamento vindo de uma requisição externa.
   * @param payload Os dados do pagamento validados, contendo o userId.
   * @returns O registro de pagamento criado.
   * @throws {RecordNotFoundError} Se o usuário especificado no payload não for encontrado.
   */
  async createPayment(payload: PaymentCreateInput): Promise<Payment> {
    // 1. Validação de regra de negócio: o usuário deve existir
    // O ID do usuário agora vem do payload
    const user = await this.userRepository.findById(payload.userId);
    if (!user) {
      throw new RecordNotFoundError(
        `Usuário com ID ${payload.userId} não foi encontrado.`
      );
    }

    // 2. Preparação dos dados para o repositório
    const payloadForRepo: PaymentCreatePayload = {
      gatewayPaymentId: payload.gatewayPaymentId,
      userId: payload.userId,
      amount: payload.amount,
      method: payload.method,
      status: "CONFIRMED", // Assumindo que o pagamento sempre vem como confirmado
      createdAt: payload.paymentDate, // Usamos a data fornecida na requisição
      app: this.app,
    };

    // 3. Cria o registro de pagamento
    const newPayment = await this.paymentRepository.create(payloadForRepo);

    // 4. Orquestração: Atualiza o status no documento do usuário
    await this.userRepository.update(payload.userId, {
      pagamentoEfetuado: true,
      dataPagamento: payload.paymentDate, // Usa a mesma data do pagamento
    });

    return newPayment;
  }

  // O método getPaymentsForUser permanece o mesmo, pois ele já recebia o userId
  async getPaymentsForUser(userId: string): Promise<Payment[]> {
    return this.paymentRepository.findByUserId(userId);
  }
}
