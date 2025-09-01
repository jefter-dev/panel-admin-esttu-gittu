"use client";

import { UserForm } from "@/components/user/user-form";
import { useParams } from "next/navigation";

export default function UserRegisterPage() {
  const params = useParams();
  const userId = params?.id as string;

  return (
    <div className="container mx-auto p-8">
      <UserForm userId={userId} />
    </div>
  );
}
