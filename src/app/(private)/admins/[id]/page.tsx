"use client";

import { AdminForm } from "@/components/admin/admin-form";
import { useParams } from "next/navigation";

export default function AdminRegisterPage() {
  const params = useParams(); // useParams do Next.js App Router
  const adminId = params?.id as string;

  return (
    <div className="container mx-auto p-8">
      <AdminForm adminId={adminId} />
    </div>
  );
}
