"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useLogin } from "@/hooks/use-login";
import { loginSchema } from "@/schemas/login.schema";

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  // 1. Instancie o hook de login
  const { submit, isLoading } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // 3. A função onSubmit agora chama o hook
  function onSubmit(data: LoginFormData) {
    submit(data);
  }

  return (
    <div className="w-full max-w-sm md:max-w-3xl">
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <header className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Bem-vindo</h1>
                  <p className="text-muted-foreground text-balance">
                    Entre na sua conta.
                  </p>
                </header>

                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemplo@email.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full cursor-pointer"
                  // 5. O botão é desabilitado pelo estado 'isLoading' do hook
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Login"}
                </Button>
              </div>
            </form>

            <div className="bg-muted relative hidden md:block">
              <Image
                src="/bg-esttu.png"
                alt="Imagem de fundo"
                fill
                className="object-cover dark:brightness-[0.7]"
                sizes="100vw"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
