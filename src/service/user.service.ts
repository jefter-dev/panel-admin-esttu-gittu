import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { APP } from "@/types/app.type";
import { UserRepository } from "@/repository/user.repository";
import { PasswordService } from "@/service/auth/password.service";
import {
  DuplicateRecordError,
  RecordNotFoundError,
} from "@/errors/custom.errors";
import { User, UserCreatePayload, UserUpdatePayload } from "@/types/user.type";
import { FilterType, FilterValue } from "@/types/filters-user.type";

export class UserService {
  private app: APP;
  private userRepository: UserRepository;
  private passwordService: PasswordService;

  constructor(app: APP) {
    const db = getFirebaseAdmin(app);
    this.app = app;
    this.userRepository = new UserRepository(db);
    this.passwordService = new PasswordService();
  }

  /**
   * @summary Creates a new user.
   * @param payload {UserCreatePayload} Data required for creating the user.
   * @returns {Promise<Omit<User, "senha">>} The newly created user without the password.
   * @throws {DuplicateRecordError} If email or CPF is already in use.
   */
  async create(payload: UserCreatePayload): Promise<Omit<User, "senha">> {
    const [existingEmail, existingCpf] = await Promise.all([
      this.userRepository.getByEmail(payload.email),
      this.userRepository.getByCPF(payload.cpf),
    ]);

    if (existingEmail) {
      throw new DuplicateRecordError("Email is already in use.");
    }
    if (existingCpf) {
      throw new DuplicateRecordError("CPF is already registered.");
    }

    const hashedPassword = await this.passwordService.hash(payload.senha);

    const payloadForRepo: UserCreatePayload = {
      ...payload,
      senha: hashedPassword,
    };

    const newUser = await this.userRepository.create(payloadForRepo);
    const { senha, ...userToReturn } = newUser;
    void senha;
    return userToReturn;
  }

  /**
   * @summary Updates an existing user by document ID.
   * @param id {string} Document ID of the user to update.
   * @param payload {UserUpdatePayload} Fields to update.
   * @returns {Promise<void>}
   * @throws {RecordNotFoundError} If the user does not exist.
   * @throws {DuplicateRecordError} If the new email is already in use.
   */
  async update(id: string, payload: UserUpdatePayload): Promise<void> {
    const userToUpdate = await this.userRepository.findByDocumentId(id);

    if (!userToUpdate) {
      throw new RecordNotFoundError("User to update not found.");
    }

    if (payload.email && payload.email !== userToUpdate.email) {
      const existingUserWithNewEmail = await this.userRepository.getByEmail(
        payload.email
      );
      if (existingUserWithNewEmail) {
        throw new DuplicateRecordError("New email is already in use.");
      }
    }

    if (payload.senha) {
      payload.senha = await this.passwordService.hash(payload.senha);
    }

    await this.userRepository.update(id, payload);
  }

  /**
   * @summary Updates a user directly by document ID.
   * @param idDocument {string} Document ID of the user to update.
   * @param payload {UserUpdatePayload} Fields to update.
   * @returns {Promise<void>}
   * @throws {RecordNotFoundError} If the user does not exist.
   * @throws {DuplicateRecordError} If the new email is already in use.
   */
  async updateByDocumentId(
    idDocument: string,
    payload: UserUpdatePayload
  ): Promise<void> {
    const userToUpdate = await this.userRepository.findByDocumentId(idDocument);
    if (!userToUpdate) {
      throw new RecordNotFoundError("User to update not found.");
    }

    if (payload.email && payload.email !== userToUpdate.email) {
      const existingUserWithNewEmail = await this.userRepository.getByEmail(
        payload.email
      );
      if (existingUserWithNewEmail) {
        throw new DuplicateRecordError("New email is already in use.");
      }
    }

    if (payload.senha) {
      payload.senha = await this.passwordService.hash(payload.senha);
    }

    await this.userRepository.updateByDocumentId(idDocument, payload);
  }

  /**
   * @summary Retrieves a user by document ID.
   * @param id {string} Document ID of the user.
   * @returns {Promise<Omit<User, "senha">>} User object without password.
   * @throws {RecordNotFoundError} If the user does not exist.
   */
  async findByDocumentId(id: string): Promise<Omit<User, "senha">> {
    const user = await this.userRepository.findByDocumentId(id);
    if (!user) {
      throw new RecordNotFoundError("User not found.");
    }

    const { senha, ...userToReturn } = user;
    void senha;
    return userToReturn;
  }

  /**
   * @summary Lists users with optional filters and pagination.
   * @param options {Object} Filtering and pagination options.
   * @param options.limit {number} Optional maximum number of records.
   * @param options.startAfter {string} Optional ID to start after for pagination.
   * @param options.pagamentoEfetuado {boolean} Optional filter by completed payments.
   * @param options.search {string} Optional search term.
   * @param options.filterType {FilterType} Optional filter type.
   * @param options.filterValue {FilterValue} Optional filter value.
   * @returns {Promise<User[]>} List of users matching the criteria.
   */
  async list(options: {
    limit?: number;
    startAfter?: string;
    pagamentoEfetuado?: boolean;
    search?: string;
    filterType?: FilterType;
    filterValue?: FilterValue;
  }): Promise<User[]> {
    return this.userRepository.find(options);
  }

  /**
   * @summary Returns the total number of users with confirmed payments.
   * @returns {Promise<number>} Count of users with confirmed payments.
   */
  async countPaymentsConfirmed(): Promise<number> {
    return this.userRepository.countPaymentsConfirmed();
  }

  /**
   * @summary Returns the total number of users.
   * @returns {Promise<number>} Total user count.
   */
  async countTotalUsers(): Promise<number> {
    return this.userRepository.countTotalUsers();
  }
}
