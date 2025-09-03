"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserDropdown } from "@/components/layout/user-dropdown";
import { getPageTitle } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="bg-card border-b border-border h-[68px] pt-[13px] pl-[70px] pr-[10px] sm:h-16 sm:pt-0 sm:pl-6 sm:flex-row flex flex-col flex-shrink-0 sm:items-center sm:justify-between gap-2">
      {/* Title + dropdown (mobile only) */}
      <div className="flex items-center justify-between w-full sm:w-auto">
        <h2
          data-cy="page-title"
          className="text-lg md:text-2xl font-bold text-card-foreground"
        >
          {title}
        </h2>

        {/* UserDropdown visível apenas no mobile */}
        <div className="sm:hidden">
          <UserDropdown />
        </div>
      </div>

      {/* Seção Desktop */}
      <div className="hidden sm:flex items-center gap-4">
        <ThemeToggle />
        <UserDropdown />
      </div>
    </header>
  );
}
