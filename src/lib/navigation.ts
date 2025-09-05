/**
 * @summary Path to the login page.
 */
export const LOGIN_PAGE = "/";

/**
 * @summary Path to the main dashboard page.
 */
export const DASHBOARD_PAGE = "/dashboard";

import { NavigationItem } from "@/types/navigation.type";
import { Settings, LayoutPanelLeft, Wallet, UserSquare } from "lucide-react";

/**
 * @summary Primary navigation items displayed in the main menu.
 */
export const PRIMARY_NAV_ITEMS: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: DASHBOARD_PAGE,
    icon: LayoutPanelLeft,
  },
  {
    id: "settings",
    label: "Configurações",
    href: "/settings",
    icon: Settings,
  },
];

/**
 * @summary Secondary navigation items, typically for submenus or less prominent sections.
 */
export const SECONDARY_NAV_ITEMS: NavigationItem[] = [
  {
    id: "users",
    label: "Usuários",
    href: "/users",
    icon: UserSquare,
  },
  {
    id: "payment",
    label: "Pagamentos",
    href: "/payments",
    icon: Wallet,
  },
];

/**
 * @summary Complete list of protected paths (all paths requiring authentication).
 * Excludes the login page.
 */
export const ALL_PROTECTED_PATHS: string[] = [
  ...PRIMARY_NAV_ITEMS.map((item) => item.href),
  ...SECONDARY_NAV_ITEMS.map((item) => item.href),
].filter((path) => path !== LOGIN_PAGE);

/**
 * @summary Paths where the secondary sidebar should be displayed.
 */
export const SECONDARY_SIDEBAR_PATHS = ["/settings"];
