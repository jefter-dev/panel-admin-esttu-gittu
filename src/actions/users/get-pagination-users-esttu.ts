"use server";

import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { UserService } from "@/services/users/users.service";
import type { User } from "@/types/user-esttu";

/**
 * Busca uma lista paginada e filtrada de usuários.
 * Esta função atua como a interface entre o cliente e o serviço do servidor.
 */
export async function getPaginationUsers(app:  "esttu" | "gittu", {
  limit,
  startAfter,
  pagamentoEfetuado,
  nome,
}: {
  limit: number;
  startAfter?: string; // Cursor para paginação. Será o 'nome' do último usuário da pág. anterior.
  pagamentoEfetuado?: boolean; // Filtro de status de pagamento.
  nome?: string; // Filtro de busca por nome.
}): Promise<{ users: User[]; hasNextPage: boolean }> {
  // 1. Instancia o serviço que interage com o Firestore.

  const db = getFirebaseAdmin(app); // ou "esttu"
  const userService = new UserService(db);

  // 2. Lógica de "buscar N+1": Pedimos um item a mais do que o limite desejado.
  // Isso nos permite saber se existe uma próxima página sem fazer uma segunda consulta.
  const queryLimit = limit + 1;

  // 3. Chama o método do serviço, passando os filtros e o limite ajustado.
  // Mapeamos a propriedade genérica 'startAfter' para a propriedade específica 'startAfterName'
  // que o nosso serviço espera.
  const users = await userService.getPaginatedFilteredUsersSimple({
    limit: queryLimit,
    startAfterName: startAfter,
    pagamentoEfetuado: pagamentoEfetuado,
    nome: nome,
  });

  // 4. Determina se existe uma próxima página.
  // Se o número de usuários retornados for maior que o limite original,
  // significa que há mais dados a serem buscados.
  const hasNextPage = users.length > limit;

  // 5. Se houver uma próxima página, removemos o item extra da lista atual.
  // Assim, garantimos que estamos enviando ao cliente apenas o número de itens que ele pediu.
  if (hasNextPage) {
    users.pop();
  }

  // 6. Retorna o objeto no formato esperado pelo componente do cliente.
  return { users, hasNextPage };
}