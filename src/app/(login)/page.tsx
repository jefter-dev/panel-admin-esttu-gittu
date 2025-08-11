import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <LoginForm />
    </div>
  );
}
