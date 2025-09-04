import { AdminForm } from "@/components/admin/admin-form";

export default function AdminRegisterPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-6 text-2xl font-bold">Cadastrar novo administrador</h1>
      <AdminForm />
    </div>
  );
}
