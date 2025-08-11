export const LOGIN_PAGE = "/";
export const DASHBOARD_PAGE = "/dashboard";

import { NavigationItem } from "@/types/navigation";
import {
  Settings,
  LayoutPanelLeft,
  Wallet,
  UserSquare,
  IdCard,
  UserCog,
} from "lucide-react";

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

export const SECONDARY_NAV_ITEMS: NavigationItem[] = [
  {
    id: "students",
    label: "Usuários",
    href: "/users",
    icon: UserSquare,
  },
  {
    id: "cards",
    label: "Carteirinhas",
    href: "/cards",
    icon: IdCard,
  },
  {
    id: "payment",
    label: "Pagamentos",
    href: "/payment",
    icon: Wallet,
  },
  {
    id: "profile",
    label: "Perfil",
    href: "/profile",
    icon: UserCog,
  },
];

export const ADDITIONAL_PROTECTED_PATHS = ["/company-registration"];

export const ALL_PROTECTED_PATHS: string[] = [
  ...PRIMARY_NAV_ITEMS.map((item) => item.href),
  ...SECONDARY_NAV_ITEMS.map((item) => item.href),
  ...ADDITIONAL_PROTECTED_PATHS,
].filter((path) => path !== LOGIN_PAGE);

export const HIDDEN_PATHS = ["/conversations"];
export const SECONDARY_SIDEBAR_PATHS = ["/settings"];
