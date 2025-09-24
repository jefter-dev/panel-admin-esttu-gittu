import Link from "next/link";
import { cn } from "@/lib/utils";
import { NavigationItem } from "@/types/navigation.type";
import { SECONDARY_NAV_ITEMS } from "@/lib/navigation";
import { useSession } from "@/context/session-context";

interface SecondarySidebarProps {
  readonly pathname: string;
  readonly open?: boolean;
}

export function SecondarySidebar({
  pathname,
  open = false
}: SecondarySidebarProps) {
  const { user } = useSession();
  const userRole = (user?.role) ?? "user";

  if (!open) return null;

  const filteredNavItems = SECONDARY_NAV_ITEMS.filter(
    (item: NavigationItem) =>
      !item.roles || item.roles.includes(userRole)
  );

  return (
    <aside
      className={cn(
        "fixed top-0 left-16 h-full bg-muted z-10 border-r border-border bg-sidebar shadow-lg",
        "w-60 p-4 py-10 overflow-y-auto"
      )}
      id="secondary-sidebar"
      data-cy="secondary-sidebar"
    >
      <nav>
        {filteredNavItems.map((item: NavigationItem) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center p-2.5 rounded-md hover:bg-accent hover:text-accent-foreground group transition-colors relative",
                isActive
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
              data-cy={`secondary-nav-${item.id}`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-9 w-[3px] rounded bg-primary" />
              )}
              <Icon
                size={18}
                strokeWidth={2.2}
                className={cn(
                  "mr-3 transition-transform transition-colors duration-200",
                  isActive
                    ? "translate-x-[5px] text-primary"
                    : "text-muted-foreground group-hover:text-accent-foreground"
                )}
              />
              <span className="text-base">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
