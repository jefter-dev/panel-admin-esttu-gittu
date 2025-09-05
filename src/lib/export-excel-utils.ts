import { Admin } from "@/types/admin.type";
import { Payment } from "@/types/payment.type";
import { User } from "@/types/user.type";

/**
 * Transforms an array of User objects into a flat structure suitable for Excel export.
 * Optional fields are filled with empty strings if they are missing.
 */
export function mapUsersForExcel(users: User[]) {
  return users.map((u) => ({
    ID: u.id || u.cid || "",
    Nome: u.nome,
    Sobrenome: u.sobrenome,
    Email: u.email,
    CPF: u.cpf,
    Celular: u.celular,
    RG: u.rg ?? "",
    "Data de Nascimento": u.dataNascimento,
    "Foto Identificação": u.fotoIdentificacao ?? "",
    "Pagamento Efetuado": u.pagamentoEfetuado ? "Sim" : "Não",
    "Data de Pagamento": u.dataPagamento
      ? new Date(u.dataPagamento).toLocaleString("pt-BR")
      : "",
    Endereço: u.endereco ?? "",
    Número: u.numero ?? "",
    Complemento: u.complemento ?? "",
    CEP: u.cep ?? "",
    Cidade: u.cidade ?? "",
    Estado: u.estado ?? "",
    Curso: u.curso ?? "",
    Escolaridade: u.escolaridade ?? "",
    Instituição: u.instituicao ?? "",
    "Ano para Renovação": u.anoParaRenovacao ?? "",
    "Documento Matrícula": u.documentMatricula ?? "",
    "Documento com Foto": u.documentoComFoto ?? "",
    CID: u.cid ?? "",
    Classe: u.classe ?? "",
    "Documento Diagnóstico": u.documentDiagnostico ?? "",
    "Nome da Mãe": u.nomeMae ?? "",
    "Nome do Pai": u.nomePai ?? "",
    "Tipo Sanguíneo": u.tipoSanguineo ?? "",
    // "Primeiro Acesso?": u.isNotFirstTime ?? false,
    // Senha: u.senha,
  }));
}

/**
 * Transforms an array of Payment objects into a flat structure suitable for Excel export.
 */
export function mapPaymentsForExcel(payments: Payment[]) {
  return payments.map((p) => ({
    ID: p.id,
    Valor: p.amount,
    "Nome do Cliente": p.customerName,
    CPF: p.customerCpf,
    Método: p.method,
    Status: p.status,
    Data: p.paymentDate
      ? new Date(p.paymentDate as string).toLocaleString("pt-BR")
      : "",
  }));
}

/**
 * Transforms an array of Admin objects into a flat structure suitable for Excel export.
 * Optional fields are filled with empty strings if they are missing.
 */
export function mapAdminsForExcel(admins: Admin[]) {
  return admins.map((a) => ({
    ID: a.id,
    Nome: a.name,
    Email: a.email,
    Função: a.role,
    App: a.app,
    "Criado por": a.adminRegisterName ?? "",
    "Criado em": a.createAt ? new Date(a.createAt).toLocaleString("pt-BR") : "",
    "Atualizado por": a.adminUpdatedName ?? "",
    "Atualizado em": a.updateAt
      ? new Date(a.updateAt).toLocaleString("pt-BR")
      : "",
  }));
}
