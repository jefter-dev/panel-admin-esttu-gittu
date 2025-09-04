/**
 * @file types/navigation.type.ts
 *
 * @summary Defines types for navigation items and sections in the application.
 */

import { LucideIcon } from "lucide-react";

/**
 * Represents a single sub-item in a navigation section.
 */
export interface NavigationSubItem {
  /** URL path for the navigation link */
  href: string;
  /** Display label for the navigation link */
  label: string;
  /** Icon component from lucide-react */
  icon: LucideIcon;
}

/**
 * Represents a section in the navigation menu.
 * Each section can contain multiple sub-items.
 */
export interface NavigationSection {
  /** Title of the section */
  title: string;
  /** List of sub-items in this section */
  items: NavigationSubItem[];
}

/**
 * Represents a primary navigation item.
 */
export interface NavigationItem {
  /** Unique identifier for the navigation item */
  id: string;
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Display label for the navigation item */
  label: string;
  /** URL path for the navigation item */
  href: string;
}
