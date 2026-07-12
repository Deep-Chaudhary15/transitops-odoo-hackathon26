// src/lib/nav.ts
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Role } from "@/lib/rbac";

export type NavItem = {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
};

export const NAV_ITEMS: NavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "FLEET_MANAGER", "DRIVER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"],
  },
  {
    key: "vehicles",
    label: "Vehicles",
    href: "/vehicles",
    icon: Truck,
    roles: ["ADMIN", "FLEET_MANAGER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"],
  },
  {
    key: "drivers",
    label: "Drivers",
    href: "/drivers",
    icon: Users,
    roles: ["ADMIN", "FLEET_MANAGER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"],
  },
  {
    key: "trips",
    label: "Trips",
    href: "/trips",
    icon: Route,
    roles: ["ADMIN", "FLEET_MANAGER", "SAFETY_OFFICER", "FINANCIAL_ANALYST", "DRIVER"],
  },
  {
    key: "maintenance",
    label: "Maintenance",
    href: "/maintenance",
    icon: Wrench,
    roles: ["ADMIN", "FLEET_MANAGER", "SAFETY_OFFICER"],
  },
  {
    key: "fuel-expenses",
    label: "Fuel & Expenses",
    href: "/fuel-expenses",
    icon: Fuel,
    roles: ["ADMIN", "FLEET_MANAGER", "FINANCIAL_ANALYST"],
  },
  {
    key: "reports",
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
    roles: ["ADMIN", "FLEET_MANAGER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"],
  },
  {
    key: "settings",
    label: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["ADMIN", "FLEET_MANAGER", "DRIVER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"],
  },
];
