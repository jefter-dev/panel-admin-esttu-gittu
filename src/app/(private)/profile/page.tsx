"use client";

import { AdminProfileCard } from "@/components/admin/admin-profile-card";

export default function ProfilePage() {
  return (
    <div className="container mx-auto flex min-h-svh flex-col items-center justify-center gap-8 p-4 md:p-8">
      <AdminProfileCard />
    </div>
  );
}
