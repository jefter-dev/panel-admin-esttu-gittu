import { LucideIcon } from "lucide-react";

export interface NavigationSubItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavigationSection {
  title: string;
  items: NavigationSubItem[];
}

export interface NavigationItem {
  id: string;
  icon: LucideIcon;
  label: string;
  href: string;
}
