"use client";

import { useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/http-client";
import { Admin } from "@/types/admin";
import { isAxiosError } from "axios";

export function useDeleteAdmin() {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteAdmin = async (admin: Admin) => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/admins/${admin.id}`);
      toast.success(`Admin ${admin.name} removido com sucesso!`);

      // TODO: rever lógica
      window.location.reload();
    } catch (err) {
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.error || "Falha ao remover admin");
      } else {
        toast.error("Ocorreu um erro inesperado.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteAdmin, isDeleting };
}
