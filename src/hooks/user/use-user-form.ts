"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { format } from "@react-input/mask";

import { UserUpdateInput, userUpdateSchema } from "@/schemas/user.schema";
import { apiClient } from "@/lib/http-client";
import { useUserDetails } from "@/hooks/user/use-user-details";

// Definindo as props que o hook receberá
interface UseUserFormProps {
  userId: string;
}

// Valores iniciais para o formulário, para evitar que os campos sejam "não controlados"
const initialDefaultValues: UserUpdateInput = {
  nome: "",
  sobrenome: "",
  email: "",
  celular: "",
  cpf: "",
  rg: "",
  dataNascimento: "",
  endereco: "",
  numero: "",
  complemento: "",
  cep: "",
  cidade: "",
  estado: "",
  curso: "",
  escolaridade: "",
  instituicao: "",
  anoParaRenovacao: "",
  documentMatricula: "",
  documentoComFoto: "",
  fotoIdentificacao: "",
};

export function useUserForm({ userId }: UseUserFormProps) {
  // 1. Lógica de busca de dados
  const { userDetails, isLoading } = useUserDetails(userId);

  // 2. Lógica de estado de submissão
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // 3. Lógica de gerenciamento do formulário
  const form = useForm<UserUpdateInput>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: initialDefaultValues,
  });

  // 4. Lógica de efeito para popular o formulário
  React.useEffect(() => {
    if (!userDetails) return;

    form.reset({
      nome: userDetails.nome ?? "",
      sobrenome: userDetails.sobrenome ?? "",
      email: userDetails.email ?? "",
      celular: userDetails.celular
        ? format(userDetails.celular, {
            mask: "(##) #####-####",
            replacement: { "#": /\d/ },
          })
        : "",
      cpf: userDetails.cpf
        ? format(userDetails.cpf, {
            mask: "###.###.###-##",
            replacement: { "#": /\d/ },
          })
        : "",
      rg: userDetails.rg ?? "",
      dataNascimento: userDetails.dataNascimento
        ? format(userDetails.dataNascimento, {
            mask: "##/##/####",
            replacement: { "#": /\d/ },
          })
        : "",
      endereco: userDetails.endereco ?? "",
      numero: userDetails.numero ?? "",
      complemento: userDetails.complemento ?? "",
      cep: userDetails.cep
        ? format(userDetails.cep, {
            mask: "#####-###",
            replacement: { "#": /\d/ },
          })
        : "",
      cidade: userDetails.cidade ?? "",
      estado: userDetails.estado ?? "",
      curso: userDetails.curso ?? "",
      escolaridade: userDetails.escolaridade ?? "",
      instituicao: userDetails.instituicao ?? "",
      anoParaRenovacao: userDetails.anoParaRenovacao ?? "",
      documentMatricula: userDetails.documentMatricula ?? "",
      documentoComFoto: userDetails.documentoComFoto ?? "",
      fotoIdentificacao: userDetails.fotoIdentificacao ?? "",
    });
  }, [userDetails, form]);

  // 5. Lógica de submissão do formulário
  async function onSubmit(data: UserUpdateInput) {
    setIsSubmitting(true);
    try {
      await apiClient.patch(`/users/${userId}`, data);
      toast.success("Usuário atualizado com sucesso!");
    } catch (error) {
      console.error("Falha ao atualizar usuário:", error);
      toast.error("Ocorreu um erro ao atualizar o usuário.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Derivando estados para simplificar o componente
  const isFormDisabled = isLoading || isSubmitting;
  const initialsName = userDetails
    ? (userDetails.nome.charAt(0) ?? "") +
      (userDetails.sobrenome.charAt(0) ?? "")
    : "";

  // 6. Retornar tudo que o componente precisa
  return {
    form,
    onSubmit,
    userDetails,
    isLoading,
    isSubmitting,
    isFormDisabled,
    initialsName,
  };
}
