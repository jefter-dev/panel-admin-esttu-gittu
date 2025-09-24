"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/context/session-context";
import { useLogout } from "@/hooks/auth/use-logout";
import {
  ChevronDown,
  LogOut,
  Settings,
  UserCircle,
  UserStar,
} from "lucide-react";
import Link from "next/link";

export function UserDropdown() {
  const { submit: logout, isLoading } = useLogout();
  const { user, isLoading: isSessionLoading } = useSession();

  const buttonText = isSessionLoading
    ? "Carregando..."
    : user?.name || "Minha Conta";

  const isAdmin = user?.role === "admin";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="text-base cursor-pointer"
          data-cy="user-dropdown-trigger"
          disabled={isSessionLoading}
        >
          <UserStar className="mr-2 h-4 w-4" />
          <span className="truncate max-w-28">{buttonText}</span>
          <ChevronDown className="ml-2 h-4 w-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56"
        data-cy="user-dropdown-content"
      >
        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <Link href="/profile" passHref>
          <DropdownMenuItem
            className="cursor-pointer"
            data-cy="user-dropdown-profile-item"
          >
            <UserCircle className="mr-2 h-4 w-4" />
            Perfil
          </DropdownMenuItem>
        </Link>

        {isAdmin && (
          <Link href="/settings" passHref>
            <DropdownMenuItem
              className="cursor-pointer"
              data-cy="user-dropdown-settings-item"
            >
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </DropdownMenuItem>
          </Link>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={logout}
          disabled={isLoading}
          className="cursor-pointer focus:bg-destructive/10 focus:text-destructive"
          data-cy="user-dropdown-logout-item"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
