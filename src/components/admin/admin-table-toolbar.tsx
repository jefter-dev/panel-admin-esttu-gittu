"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { Admin } from "@/types/admin.type";
import { useExportToExcel } from "@/hooks/use-export-to-excel";
import { mapAdminsForExcel } from "@/lib/export-excel-utils";

interface AdminTableToolbarProps {
  admins: Admin[];
}

export function AdminTableToolbar({ admins }: AdminTableToolbarProps) {
  const { exportToExcel, isExporting } = useExportToExcel();

  return (
    <div className="flex items-center justify-between gap-2 py-4">
      <h2 className="text-2xl font-bold">Usuários | Admins</h2>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() =>
            exportToExcel(mapAdminsForExcel(admins), "Administradores")
          }
          disabled={isExporting}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Download size={14} />
          {isExporting ? "Exportando..." : "Exportar Excel"}
        </Button>
        <Link href="/admins/register">
          <Button className="flex items-center gap-2 cursor-pointer">
            <Plus className="h-4 w-4" />
            Novo Admin
          </Button>
        </Link>
      </div>
    </div>
  );
}
