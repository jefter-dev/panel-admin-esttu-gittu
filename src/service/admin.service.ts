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
      app: payload.app || this.app,
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

  /**
   * Remove um administrador pelo ID.
   * @param id O UUID do admin a ser removido.
   * @param deletedByAdminId O ID do admin que está realizando a ação (para auditoria).
   * @throws {RecordNotFoundError} Se o admin não existir.
   */
  async delete(id: string): Promise<void> {
    // Primeiro verificamos se o admin existe
    const adminToDelete = await this.adminRepository.findById(id);
    if (!adminToDelete) {
      throw new RecordNotFoundError(
        "Administrador a ser removido não encontrado."
      );
    }

    await this.adminRepository.delete(id);
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

  async findAll(): Promise<
    Array<
      Omit<Admin, "password"> & {
        adminRegisterName?: string;
        adminUpdatedName?: string;
      }
    >
  > {
    const admins = await this.adminRepository.findAll();

    // Map de ID → nome para evitar múltiplas consultas repetidas
    const adminIds = new Set<string>();
    admins.forEach((a) => {
      if (a.adminRegister) adminIds.add(a.adminRegister);
      if (a.adminUpdated) adminIds.add(a.adminUpdated);
    });

    // Buscar todos os admins de uma vez
    const adminDetails = await Promise.all(
      Array.from(adminIds).map((id) => this.adminRepository.findById(id))
    );

    const idToNameMap = new Map<string, string>();
    adminDetails.forEach((a) => {
      if (a) idToNameMap.set(a.id, a.name);
    });

    // Retorna admins com nomes de adminRegister e adminUpdated, omitindo a senha
    return admins.map((admin) => ({
      ...admin,
      adminRegisterName: admin.adminRegister
        ? idToNameMap.get(admin.adminRegister)
        : undefined,
      adminUpdatedName: admin.adminUpdated
        ? idToNameMap.get(admin.adminUpdated)
        : undefined,
    }));
  }
}
