"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminProfileCardSkeleton() {
  return (
    <Card className="w-full max-w-lg animate-pulse">
      <CardHeader className="text-center">
        {/* Name */}
        <CardTitle>
          <Skeleton className="mx-auto h-8 w-48 rounded" />
        </CardTitle>
        {/* Email */}
        <CardDescription>
          <Skeleton className="mx-auto h-4 w-64 rounded mt-2" />
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
        {/* Access */}
        <div>
          <p className="font-semibold text-muted-foreground">Acesso</p>
          <Skeleton className="h-6 w-24 rounded mt-1" />
        </div>
        {/* Application (App) */}
        <div>
          <p className="font-semibold text-muted-foreground">Aplicação (App)</p>
          <Skeleton className="h-6 w-24 rounded mt-1" />
        </div>
        {/* Create at */}
        <div className="sm:col-span-2">
          <p className="font-semibold text-muted-foreground">Criado em</p>
          <Skeleton className="h-4 w-48 rounded mt-1" />
        </div>
        {/* Last updated */}
        <div className="sm:col-span-2">
          <p className="font-semibold text-muted-foreground">
            Última Atualização
          </p>
          <Skeleton className="h-4 w-48 rounded mt-1" />
        </div>
      </CardContent>
    </Card>
  );
}
