"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Admin, Role } from "@/types/admin.type";
import {
  adminCreateSchema,
  adminUpdateSchema,
  AdminCreateInput,
  AdminUpdateInput,
} from "@/schemas/admin.schema";
import { apiClient } from "@/lib/http-client";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";

interface UseAdminFormProps {
  adminId?: string;
}

export function useAdminForm({ adminId }: UseAdminFormProps) {
  const [adminDetails, setAdminDetails] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(!!adminId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const form = useForm<AdminCreateInput | AdminUpdateInput>({
    resolver: zodResolver(adminId ? adminUpdateSchema : adminCreateSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: Role.ADMIN,
      app: "gittu",
    },
  });

  useEffect(() => {
    if (adminId) {
      setIsLoading(true);
      apiClient
        .get<Admin>(`/admins/${adminId}`)
        .then((res) => {
          const data = res.data;
          setAdminDetails(data);
          form.reset({
            name: data.name,
            email: data.email,
            password: "",
            role: data.role,
            app: data.app,
          });
        })
        .catch(() => toast.error("Erro ao carregar admin"))
        .finally(() => setIsLoading(false));
    }
  }, [adminId, form]);

  const onSubmit = async (values: AdminCreateInput | AdminUpdateInput) => {
    setIsSubmitting(true);
    try {
      if (adminId) {
        await apiClient.patch(`/admins/${adminId}`, values);
        toast.success("Admin atualizado com sucesso!");
      } else {
        await apiClient.post(`/admins`, values);
        toast.success("Admin criado com sucesso!");

        router.push("/settings");
      }
    } catch (err) {
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.error || "Erro ao salvar admin");
      } else {
        toast.error("Ocorreu um erro inesperado.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    onSubmit,
    adminDetails,
    isLoading,
    isSubmitting,
  };
}
