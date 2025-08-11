import React from "react";

interface PainelRootProps {
  readonly children: React.ReactNode;
}

export function PainelRoot({ children }: PainelRootProps) {
  return (
    <div className="group flex h-screen bg-white text-gray-900 dark:text-gray-100">
      {children}
    </div>
  );
}
