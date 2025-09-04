import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { AdminRepository } from "@/repository/admin.repository";
import { APP } from "@/types/app.type";
import {
  Admin,
  AdminCreatePayload,
  AdminCreationRequest,
  AdminUpdatePayload,
} from "@/types/admin.type";
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

  /**
   * @summary Creates a new admin user.
   * @param payload {AdminCreationRequest} Data for creating the admin.
   * @param registeredByAdminId {string} ID of the admin registering this user.
   * @returns {Promise<Omit<Admin, "password">>} Newly created admin without password.
   * @throws {DuplicateRecordError} If the email is already in use.
   */
  async create(
    payload: AdminCreationRequest,
    registeredByAdminId: string
  ): Promise<Omit<Admin, "password">> {
    const existingAdmin = await this.adminRepository.getByEmail(payload.email);
    if (existingAdmin) {
      throw new DuplicateRecordError("Email is already in use.");
    }

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

  /**
   * @summary Updates an existing admin.
   * @param idToUpdate {string} Admin ID to update.
   * @param payload {Partial<AdminCreationRequest>} Fields to update.
   * @param updatedByAdminId {string} Admin ID performing the update.
   * @returns {Promise<void>}
   * @throws {RecordNotFoundError} If the admin does not exist.
   * @throws {DuplicateRecordError} If the new email is already in use.
   */
  async update(
    idToUpdate: string,
    payload: Partial<AdminCreationRequest>,
    updatedByAdminId: string
  ): Promise<void> {
    const adminToUpdate = await this.adminRepository.findById(idToUpdate);
    if (!adminToUpdate) {
      throw new RecordNotFoundError("Admin to update not found.");
    }

    if (payload.email && payload.email !== adminToUpdate.email) {
      const existingAdminWithNewEmail = await this.adminRepository.getByEmail(
        payload.email
      );
      if (existingAdminWithNewEmail) {
        throw new DuplicateRecordError("New email is already in use.");
      }
    }

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
   * @summary Deletes an admin by ID.
   * @param id {string} Admin ID to delete.
   * @throws {RecordNotFoundError} If the admin does not exist.
   */
  async delete(id: string): Promise<void> {
    const adminToDelete = await this.adminRepository.findById(id);
    if (!adminToDelete) {
      throw new RecordNotFoundError("Admin to delete not found.");
    }

    await this.adminRepository.delete(id);
  }

  /**
   * @summary Retrieves an admin by ID.
   * @param id {string} Admin ID to fetch.
   * @returns {Promise<Omit<Admin, "password">>} Admin object without password.
   * @throws {RecordNotFoundError} If the admin does not exist.
   */
  async findById(id: string): Promise<Omit<Admin, "password">> {
    const admin = await this.adminRepository.findById(id);
    if (!admin) {
      throw new RecordNotFoundError("Admin not found.");
    }

    const { password, ...adminToReturn } = admin;
    void password;

    return adminToReturn;
  }

  /**
   * @summary Retrieves all admins with optional audit names.
   * @returns {Promise<Array<Omit<Admin, "password"> & {adminRegisterName?: string; adminUpdatedName?: string;}>>}
   * List of admins including names of registering and updating admins.
   */
  async findAll(): Promise<
    Array<
      Omit<Admin, "password"> & {
        adminRegisterName?: string;
        adminUpdatedName?: string;
      }
    >
  > {
    const admins = await this.adminRepository.findAll();

    const adminIds = new Set<string>();
    admins.forEach((a) => {
      if (a.adminRegister) adminIds.add(a.adminRegister);
      if (a.adminUpdated) adminIds.add(a.adminUpdated);
    });

    const adminDetails = await Promise.all(
      Array.from(adminIds).map((id) => this.adminRepository.findById(id))
    );

    const idToNameMap = new Map<string, string>();
    adminDetails.forEach((a) => {
      if (a) idToNameMap.set(a.id, a.name);
    });

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
