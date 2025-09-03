"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowBigLeftIcon, Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Role } from "@/types/admin.type";
import { APP } from "@/types/app.type";
import { useAdminForm } from "@/hooks/admin/use-admin-form";
import { AdminCreateInput, AdminUpdateInput } from "@/schemas/admin.schema";

interface AdminFormProps {
  adminId?: string;
}

function LoadingSpinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <p>Carregando dados do admin...</p>
    </div>
  );
}

export function AdminForm({ adminId }: AdminFormProps) {
  const { form, onSubmit, adminDetails, isLoading, isSubmitting } =
    useAdminForm({ adminId });

  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      {adminId && (
        <h1 className="mb-6 flex items-center gap-4 text-2xl font-bold">
          Editar administrador: {adminDetails?.name ?? ""}
        </h1>
      )}

      <Form<AdminCreateInput | AdminUpdateInput> {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 max-w-2xl"
        >
          {/* Nome */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o nome" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Digite o email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Senha - visível sempre */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Senha{" "}
                  {adminId && (
                    <span className="text-xs">
                      (deixe em branco para não alterar)
                    </span>
                  )}
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={
                      adminId
                        ? "Digite uma nova senha (opcional)"
                        : "Digite a senha"
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Role */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Acesso</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o acesso" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                    <SelectItem value={Role.USER}>Usuário</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* App */}
          <FormField
            control={form.control}
            name="app"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aplicativo</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value as APP}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o aplicativo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="esttu">Esttu</SelectItem>
                    <SelectItem value="gittu">Gittu</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Botões */}
          <div className="flex gap-2">
            <Link href="/settings">
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
              disabled={isSubmitting}
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
