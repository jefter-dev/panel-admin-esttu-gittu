import { onDocumentWritten } from "firebase-functions/v2/firestore"; // 1. Import específico da v2
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger"; // Logger recomendado para a v2

admin.initializeApp();

/**
 * Gera um array de palavras-chave em minúsculas a partir dos campos de um usuário.
 */
function generateKeywords(...fields: (string | undefined)[]): string[] {
  const searchableText = fields.filter(Boolean).join(" ").toLowerCase();
  const words = searchableText
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
  return Array.from(new Set(words));
}

/**
 * Esta função (v2) é acionada sempre que um documento na coleção 'users' é criado ou atualizado.
 * Ela cria/atualiza um campo 'search_keywords' para permitir buscas complexas.
 */
export const indexUserForSearch = onDocumentWritten(
  "users/{userId}",
  async (event) => {
    // 2. O objeto 'event' substitui o antigo 'change' e 'context'

    // Se o documento foi excluído, não há nada a fazer.
    // Em onDocumentWritten, o 'after' sempre existe, mas 'data()' pode ser undefined.
    const documentSnapshot = event.data?.after;
    if (!documentSnapshot?.exists) {
      logger.log(
        `Documento ${event.params.userId} excluído. Nenhuma ação de indexação.`
      );
      return;
    }

    const userData = documentSnapshot.data();
    if (!userData) {
      logger.warn(
        `Dados não encontrados no documento ${event.params.userId} após a escrita.`
      );
      return;
    }

    // Gera as palavras-chave a partir dos campos relevantes.
    const keywords = generateKeywords(
      userData.nome,
      userData.sobrenome,
      userData.email,
      userData.celular
    );

    // Opcional: verifica se as keywords realmente mudaram para evitar escritas desnecessárias
    const existingKeywords = userData.search_keywords || [];
    if (JSON.stringify(existingKeywords) === JSON.stringify(keywords)) {
      logger.log(
        `Keywords para ${event.params.userId} não mudaram. Nenhuma atualização necessária.`
      );
      return;
    }

    logger.log(`Indexando keywords para o usuário: ${event.params.userId}`);

    // 3. O 'ref' para o documento agora está dentro do snapshot
    return documentSnapshot.ref.set(
      { search_keywords: keywords },
      { merge: true }
    );
  }
);
