"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { UserUpdateInput, userUpdateSchema } from "@/schemas/user.schema";
import { apiClient } from "@/lib/http-client";
import { useUserDetails } from "@/hooks/user/use-user-details";
import axios from "axios";

interface UseUserFormProps {
  userId: string;
}

export function useUserForm({ userId }: UseUserFormProps) {
  const { userDetails: fetchedUser, isLoading: isFetching } =
    useUserDetails(userId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UserUpdateInput>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: fetchedUser ?? {},
  });

  const isFormDisabled = isSubmitting || isFetching;

  const initialsName = useMemo(() => {
    if (!fetchedUser) return "";
    return `${fetchedUser.nome[0] ?? ""}${
      fetchedUser.sobrenome[0] ?? ""
    }`.toUpperCase();
  }, [fetchedUser]);

  /**
   * Handles form submission and updates the user.
   * Displays success or error notifications.
   */
  const onSubmit = async (values: UserUpdateInput) => {
    setIsSubmitting(true);
    try {
      await apiClient.put(`/users/${userId}`, values);
      toast.success("User updated successfully");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to update user");
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update user");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (fetchedUser) {
      form.reset({
        ...fetchedUser,
        pagamentoEfetuado: !!fetchedUser.pagamentoEfetuado,
      });
    }
  }, [fetchedUser, form]);

  return {
    form,
    onSubmit,
    userDetails: fetchedUser,
    isLoading: isFetching,
    isSubmitting,
    isFormDisabled,
    initialsName,
  };
}
