import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { APP } from "@/types/app";
import { UserRepository } from "@/repository/user.repository";
import { PasswordService } from "./auth/password.service";
import {
  DuplicateRecordError,
  RecordNotFoundError,
} from "@/errors/custom.errors";
import { User, UserCreatePayload, UserUpdatePayload } from "@/types/user";

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

  async create(payload: UserCreatePayload): Promise<Omit<User, "senha">> {
    const [existingEmail, existingCpf] = await Promise.all([
      this.userRepository.getByEmail(payload.email),
      this.userRepository.getByCPF(payload.cpf),
    ]);

    if (existingEmail) {
      throw new DuplicateRecordError("Este e-mail já está em uso.");
    }
    if (existingCpf) {
      throw new DuplicateRecordError("Este CPF já está cadastrado.");
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

  async update(id: string, payload: UserUpdatePayload): Promise<void> {
    const userToUpdate = await this.userRepository.findById(id);
    if (!userToUpdate) {
      throw new RecordNotFoundError("Usuário a ser atualizado não encontrado.");
    }

    if (payload.email && payload.email !== userToUpdate.email) {
      const existingUserWithNewEmail = await this.userRepository.getByEmail(
        payload.email
      );
      if (existingUserWithNewEmail) {
        throw new DuplicateRecordError(
          "O novo e-mail fornecido já está em uso."
        );
      }
    }

    if (payload.senha) {
      payload.senha = await this.passwordService.hash(payload.senha);
    }

    await this.userRepository.update(id, payload);
  }

  async findById(id: string): Promise<Omit<User, "senha">> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new RecordNotFoundError("Usuário não encontrado.");
    }
    const { senha, ...userToReturn } = user;
    void senha;

    return userToReturn;
  }

  async list(options: {
    limit?: number;
    startAfterName?: string;
    pagamentoEfetuado?: boolean;
    nome?: string;
  }): Promise<User[]> {
    return this.userRepository.find(options);
  }
}
