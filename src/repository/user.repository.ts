import { v4 as uuidv4 } from "uuid";
import type { Firestore, Query } from "firebase-admin/firestore";
import { FirestoreBaseService } from "@/service/firebase/firestore-base.service";
import { DataPersistenceError } from "@/errors/custom.errors";
import { User, UserCreatePayload, UserUpdatePayload } from "@/types/user";
import { formatCPF, isCPF, isEmail } from "@/lib/utils";
import { FilterType, FilterValue } from "@/types/filters-user";

export class UserRepository extends FirestoreBaseService {
  private collection: FirebaseFirestore.CollectionReference;

  constructor(private db: Firestore) {
    super();
    this.collection = db.collection("users");
  }

  async create(payload: UserCreatePayload): Promise<User> {
    try {
      const newId = uuidv4();
      const docRef = this.collection.doc();
      const dataToSave: User = {
        id: newId,
        idDocument: docRef.id,
        ...payload,
      };

      await docRef.set(dataToSave);
      return dataToSave;
    } catch (error) {
      console.error(
        "[UserRepository.create] Erro ao criar novo usuário:",
        error
      );
      throw new DataPersistenceError(
        "Falha ao criar usuário no banco de dados."
      );
    }
  }

  async update(id: string, payload: UserUpdatePayload): Promise<void> {
    try {
      const docRef = await this.findDocRefByUuid(id);
      if (!docRef) {
        throw new Error(
          `Usuário para atualização não encontrado com o UUID ${id}.`
        );
      }
      await docRef.update(payload);
    } catch (error) {
      console.error(
        `[UserRepository.update] Erro ao atualizar usuário com id ${id}:`,
        error
      );
      throw new DataPersistenceError(
        "Falha ao atualizar usuário no banco de dados."
      );
    }
  }

  async updateByDocumentId(
    idDocument: string,
    payload: UserUpdatePayload
  ): Promise<void> {
    try {
      const docRef = this.collection.doc(idDocument);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        throw new Error(
          `Usuário para atualização não encontrado com o idDocument ${idDocument}.`
        );
      }

      await docRef.update(payload);
    } catch (error) {
      console.error(
        `[UserRepository.updateByDocumentId] Erro ao atualizar usuário com idDocument ${idDocument}:`,
        error
      );
      throw new DataPersistenceError(
        "Falha ao atualizar usuário no banco de dados."
      );
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const snapshot = await this.collection
        .where("id", "==", id)
        .limit(1)
        .get();
      if (snapshot.empty) return null;
      return this.mapDocTo<User>(snapshot.docs[0]);
    } catch (error) {
      console.error(
        `[UserRepository.findById] Erro ao buscar usuário com id ${id}:`,
        error
      );
      throw new DataPersistenceError("Falha ao buscar usuário por ID.");
    }
  }

  async findByDocumentId(idDocument: string): Promise<User | null> {
    try {
      const docSnap = await this.collection.doc(idDocument).get();
      if (!docSnap.exists) return null;

      return this.mapDocTo<User>(docSnap);
    } catch (error) {
      console.error(
        `[UserRepository.findByDocumentId] Erro ao buscar usuário com idDocument ${idDocument}:`,
        error
      );
      throw new DataPersistenceError("Falha ao buscar usuário por idDocument.");
    }
  }

  async getByCPF(cpf: string): Promise<User | null> {
    try {
      const snapshot = await this.collection
        .where("cpf", "==", cpf)
        .limit(1)
        .get();
      if (snapshot.empty) return null;
      return this.mapDocTo<User>(snapshot.docs[0]);
    } catch (error) {
      console.error(
        `[UserRepository.getByCPF] Erro ao buscar usuário com CPF ${cpf}:`,
        error
      );
      throw new DataPersistenceError("Falha ao buscar usuário por CPF.");
    }
  }

  async getByEmail(email: string): Promise<User | null> {
    try {
      const snapshot = await this.collection
        .where("email", "==", email)
        .limit(1)
        .get();
      if (snapshot.empty) return null;
      return this.mapDocTo<User>(snapshot.docs[0]);
    } catch (error) {
      console.error(
        `[UserRepository.getByEmail] Erro ao buscar usuário com email ${email}:`,
        error
      );
      throw new DataPersistenceError("Falha ao buscar usuário por e-mail.");
    }
  }

  async find(options: {
    limit?: number;
    pagamentoEfetuado?: boolean;
    search?: string;
    filterType?: FilterType; // Agora aceita ""
    filterValue?: FilterValue;
  }): Promise<User[]> {
    const {
      limit = 20,
      pagamentoEfetuado,
      search,
      filterType,
      filterValue,
    } = options;

    try {
      // ===================================================================
      // LÓGICA 1: FILTRO AVANÇADO (PRIORIDADE MÁXIMA)
      // Se filterType e filterValue estão presentes, ignora o 'search'.
      // ===================================================================
      if (filterType && filterValue && filterValue.trim() !== "") {
        let query: Query = this.collection.where(
          filterType,
          "==",
          filterValue.trim()
        );

        // Aplica filtro de pagamento, se houver
        if (typeof pagamentoEfetuado === "boolean") {
          query = query.where("pagamentoEfetuado", "==", pagamentoEfetuado);
        }

        const snapshot = await query.limit(limit).get();
        return snapshot.docs.map((doc) => this.mapDocTo<User>(doc));
      }

      // ===================================================================
      // LÓGICA 2: BUSCA GERAL POR TEXTO ('search')
      // Executa somente se não houver filtro avançado.
      // ===================================================================
      const searchTerm = search?.trim();
      if (searchTerm) {
        // 2.1 Busca por Email exato
        if (isEmail(searchTerm)) {
          // Nota: Firestore não permite aplicar outros filtros (como pagamento)
          // em buscas de igualdade simples com `getByEmail`.
          // Se precisar combinar, a query teria que ser reescrita.
          const user = await this.getByEmail(searchTerm);
          return user ? [user] : [];
        }

        // 2.2 Busca por CPF exato
        if (isCPF(searchTerm)) {
          const formattedCpf = formatCPF(searchTerm);
          const user = await this.getByCPF(formattedCpf);
          return user ? [user] : [];
        }

        // 2.3 Busca por Nome / Sobrenome parcial
        const endTerm = searchTerm + "\uf8ff";
        let baseQuery: Query = this.collection;

        // Aplica filtro de pagamento, se houver
        if (typeof pagamentoEfetuado === "boolean") {
          baseQuery = baseQuery.where(
            "pagamentoEfetuado",
            "==",
            pagamentoEfetuado
          );
        }

        // Query para NOME
        const queryNome = baseQuery
          .orderBy("nome")
          .startAt(searchTerm)
          .endAt(endTerm);

        // Query para SOBRENOME
        const querySobrenome = baseQuery
          .orderBy("sobrenome")
          .startAt(searchTerm)
          .endAt(endTerm);

        const [snapshotNome, snapshotSobrenome] = await Promise.all([
          queryNome.get(),
          querySobrenome.get(),
        ]);

        const usersMap = new Map<string, User>();
        snapshotNome.docs.forEach((doc) => {
          const user = this.mapDocTo<User>(doc);
          usersMap.set(user.id, user);
        });
        snapshotSobrenome.docs.forEach((doc) => {
          const user = this.mapDocTo<User>(doc);
          usersMap.set(user.id, user);
        });

        const combinedUsers = Array.from(usersMap.values());
        combinedUsers.sort((a, b) => a.nome.localeCompare(b.nome));

        return combinedUsers.slice(0, limit);
      }

      // ===================================================================
      // LÓGICA 3: LISTAGEM SIMPLES (FALLBACK)
      // Se não há filtro avançado nem busca geral.
      // ===================================================================
      let query: Query = this.collection.orderBy("nome");

      if (typeof pagamentoEfetuado === "boolean") {
        query = query.where("pagamentoEfetuado", "==", pagamentoEfetuado);
      }

      const snapshot = await query.limit(limit).get();
      return snapshot.docs.map((doc) => this.mapDocTo<User>(doc));
    } catch (error) {
      console.error("[UserRepository.find] Erro ao buscar usuários:", error);
      throw new DataPersistenceError("Falha ao listar usuários.");
    }
  }

  /**
   * Conta o total de usuários com pagamento efetuado (pagamentoEfetuado = true).
   */
  async countPaymentsConfirmed(): Promise<number> {
    try {
      const query = this.collection.where("pagamentoEfetuado", "==", true);

      // Usando agregação para contar (mais performático)
      const snapshot = await query.count().get();

      return snapshot.data().count;
    } catch (error) {
      console.error(
        "[UserRepository.countPagamentosEfetuados] Erro ao contar usuários com pagamento efetuado:",
        error
      );
      throw new DataPersistenceError(
        "Falha ao contar usuários com pagamento efetuado."
      );
    }
  }

  /**
   * Conta o total de usuários cadastrados.
   */
  async countTotalUsers(): Promise<number> {
    try {
      const snapshot = await this.collection.count().get();
      return snapshot.data().count;
    } catch (error) {
      console.error(
        "[UserRepository.countTotalUsers] Erro ao contar usuários:",
        error
      );
      throw new DataPersistenceError("Falha ao contar usuários.");
    }
  }

  private async findDocRefByUuid(
    id: string
  ): Promise<FirebaseFirestore.DocumentReference | null> {
    const snapshot = await this.collection.where("id", "==", id).limit(1).get();
    if (snapshot.empty) return null;
    return snapshot.docs[0].ref;
  }
}
