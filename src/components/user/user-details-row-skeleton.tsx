"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function UserDetailsSkeleton() {
  return (
    <div className="p-4 bg-muted rounded-sm animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Documents */}
        <div className="space-y-4">
          <Skeleton className="h-5 w-32" /> {/* Title */}
          <Skeleton className="h-24 w-24 rounded-md" /> {/* Photo */}
          <Skeleton className="h-8 w-20" /> {/* Button Download */}
          <Skeleton className="h-8 w-24" /> {/* QR Code Button */}
        </div>

        {/* Personal Data */}
        <div className="space-y-4">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-28" />
          ))}
        </div>

        {/* Academic Data or Doctors */}
        <div className="space-y-4">
          <Skeleton className="h-5 w-36" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-32" />
          ))}
        </div>

        {/* Address + Finance */}
        <div className="space-y-4">
          <Skeleton className="h-5 w-24" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-36" />
          ))}
          <Skeleton className="h-5 w-24 mt-4" />
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-28" />
          ))}
        </div>
      </div>
    </div>
  );
}
