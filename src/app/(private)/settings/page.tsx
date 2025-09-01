import Link from "next/link";
import { AdminTable } from "@/components/admin/admin-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex min-h-svh flex-col p-6 md:p-10 gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Usuários | Admins</h1>
        <Link href="/admins/register">
          <Button className="flex items-center gap-2 cursor-pointer">
            <Plus className="h-4 w-4" />
            Novo Admin
          </Button>
        </Link>
      </div>

      <AdminTable />
    </div>
  );
}
