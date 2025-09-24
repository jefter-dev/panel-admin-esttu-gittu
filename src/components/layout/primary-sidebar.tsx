import Link from "next/link";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PRIMARY_NAV_ITEMS } from "@/lib/navigation";
import { useSession } from "@/context/session-context";
import { NavigationItem } from "@/types/navigation.type";

interface PrimarySidebarProps {
  readonly pathname: string;
  readonly onLogout: () => void;
}

export function PrimarySidebar({ pathname, onLogout }: PrimarySidebarProps) {
  const { user, isLoading } = useSession();
  const userRole = (user?.role) ?? "user";

  const filteredNavItems = PRIMARY_NAV_ITEMS.filter(
    (item: NavigationItem) =>
      !item.roles || item.roles.includes(userRole)
  );

  return (
    <aside
      className="fixed top-0 py-12 pt-4 z-20 left-0 h-full w-16 border-r border-border bg-sidebar shadow-lg flex flex-col justify-between"
      data-cy="primary-sidebar"
    >
      <div>
        <Link
          href="/dashboard"
          className="flex justify-center px-3 mb-30 cursor-pointer"
          aria-label="Página Inicial"
          data-cy="logo-link"
        >
          {!isLoading && user && (
            <Image
              src={`/logo-${user.app}.png`}
              alt="Logo"
              width={50}
              height={50}
              quality={100}
              data-cy="logo-image"
            />
          )}
        </Link>

        <nav className="flex flex-col space-y-3 px-3">
          {filteredNavItems.map((navItem) => {
            const Icon = navItem.icon;
            const isActive = pathname.startsWith(navItem.href);

            return (
              <Link
                key={navItem.id}
                href={navItem.href}
                title={navItem.label}
                aria-label={navItem.label}
                className={cn(
                  "relative p-2.5 rounded-lg transition-colors flex justify-start",
                  "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive && "bg-primary text-sidebar-primary-foreground"
                )}
                data-cy={`primary-nav-item-${navItem.id}`}
              >
                <Icon
                  size={22}
                  strokeWidth={2.2}
                  className={cn(
                    "transition-all duration-200",
                    isActive && "dark:text-background"
                  )}
                />
              </Link>
            );
          })}
        </nav>
      </div>

      <Button
        variant="ghost"
        size="icon"
        title="Logout"
        aria-label="Logout"
        onClick={onLogout}
        className="cursor-pointer self-center rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
        data-cy="primary-sidebar-logout-button"
      >
        <LogOut size={22} strokeWidth={2.2} />
      </Button>
    </aside>
  );
}
