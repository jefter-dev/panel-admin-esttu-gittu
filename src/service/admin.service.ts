import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { AdminRepository } from "@/repository/admin.repository";
import { APP } from "@/types/app";
import {
  Admin,
  AdminCreatePayload,
  AdminCreationRequest,
  AdminUpdatePayload,
} from "@/types/admin";
import { PasswordService } from "@/service/auth/password.service";
import {
  DuplicateRecordError,
  RecordNotFoundError,
} from "@/errors/custom.errors";

export class AdminService {
  private app: APP;
  private adminRepository: AdminRepository;
  private passwordService: PasswordService;

  constructor(app: APP) {
    const db = getFirebaseAdmin(app);
    this.app = app;
    this.adminRepository = new AdminRepository(db);
    this.passwordService = new PasswordService();
  }

  async create(
    payload: AdminCreationRequest,
    registeredByAdminId: string
  ): Promise<Omit<Admin, "password">> {
    const existingAdmin = await this.adminRepository.getByEmail(payload.email);
    if (existingAdmin) {
      throw new DuplicateRecordError("Este e-mail já está em uso.");
    }

    // Não é necessário try/catch aqui. Se o repositório lançar um erro,
    // ele deve simplesmente "borbulhar" para a camada da API.

    const hashedPassword = await this.passwordService.hash(payload.password);
    const nowISO = new Date().toISOString();
    const payloadForRepo: AdminCreatePayload = {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role,
      createAt: nowISO,
      updateAt: nowISO,
      adminRegister: registeredByAdminId,
      adminUpdated: registeredByAdminId,
      app: this.app,
    };

    const newAdmin = await this.adminRepository.create(payloadForRepo);

    const { password, ...adminToReturn } = newAdmin;
    void password;

    return adminToReturn;
  }

  async update(
    idToUpdate: string,
    payload: Partial<AdminCreationRequest>,
    updatedByAdminId: string
  ): Promise<void> {
    const adminToUpdate = await this.adminRepository.findById(idToUpdate);
    if (!adminToUpdate) {
      throw new RecordNotFoundError(
        "Administrador a ser atualizado não encontrado."
      );
    }

    if (payload.email && payload.email !== adminToUpdate.email) {
      const existingAdminWithNewEmail = await this.adminRepository.getByEmail(
        payload.email
      );
      if (existingAdminWithNewEmail) {
        throw new DuplicateRecordError(
          "O novo e-mail fornecido já está em uso."
        );
      }
    }

    // Novamente, sem try/catch. Deixe o erro subir.

    const dataToUpdate: AdminUpdatePayload = { ...payload };

    if (dataToUpdate.password) {
      dataToUpdate.password = await this.passwordService.hash(
        dataToUpdate.password
      );
    }

    dataToUpdate.updateAt = new Date().toISOString();
    dataToUpdate.adminUpdated = updatedByAdminId;

    await this.adminRepository.update(idToUpdate, dataToUpdate);
  }

  async findById(id: string): Promise<Omit<Admin, "password">> {
    // 1. Chama o repositório para buscar o registro no banco de dados.
    const admin = await this.adminRepository.findById(id);

    // 2. A camada de serviço traduz a ausência de um registro (null)
    //    em um erro de negócio específico que a API pode entender.
    if (!admin) {
      throw new RecordNotFoundError("Administrador não encontrado.");
    }

    // 3. Camada de segurança: remove o hash da senha antes de retornar
    //    os dados para a camada superior (a rota da API).
    const { password, ...adminToReturn } = admin;
    void password;

    return adminToReturn;
  }
}
