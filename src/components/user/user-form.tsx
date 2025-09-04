"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowBigLeftIcon, Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PersonalDataSection } from "@/components/user/section-forms/user-form-section-personal-data";
import { AcademicInfoSection } from "@/components/user/section-forms/user-form-academic-info-section";
import { AddressSection } from "@/components/user/section-forms/user-form-address-section";
import { useUserForm } from "@/hooks/user/use-user-form";
import { UserFormPaymentSection } from "@/components/user/section-forms/user-form-payment-section";

interface UserFormProps {
  userId: string;
}

function LoadingSpinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <p>Carregando dados do usuário...</p>
    </div>
  );
}

function ErrorMessage() {
  return (
    <div className="flex h-64 items-center justify-center">
      <p>Usuário não encontrado ou falha ao carregar dados.</p>
    </div>
  );
}

export function UserForm({ userId }: UserFormProps) {
  const {
    form,
    onSubmit,
    userDetails,
    isLoading,
    isSubmitting,
    isFormDisabled,
    initialsName,
  } = useUserForm({ userId });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!userDetails) {
    return <ErrorMessage />;
  }

  return (
    <>
      <h1 className="mb-6 flex items-center gap-4 text-2xl font-bold">
        <Avatar className="h-12 w-12">
          <AvatarImage
            src={
              userDetails.fotoIdentificacao
                ? userDetails.fotoIdentificacao
                : undefined
            }
            alt="Avatar do usuário"
          />
          <AvatarFallback>{initialsName}</AvatarFallback>
        </Avatar>
        {userDetails.nome} {userDetails.sobrenome}
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-12 gap-8">
            <PersonalDataSection
              control={form.control}
              isDisabled={isFormDisabled}
            />
            <AcademicInfoSection
              control={form.control}
              isDisabled={isFormDisabled}
            />
            <UserFormPaymentSection
              control={form.control}
              isDisabled={isFormDisabled}
            />
            <AddressSection
              control={form.control}
              isDisabled={isFormDisabled}
            />
          </div>

          <div className="flex gap-2">
            <Link href="/users">
              <Button
                variant="outline"
                className="cursor-pointer flex items-center gap-2"
              >
                <ArrowBigLeftIcon className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <Button
              type="submit"
              className="cursor-pointer gap-2"
              disabled={isFormDisabled}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
