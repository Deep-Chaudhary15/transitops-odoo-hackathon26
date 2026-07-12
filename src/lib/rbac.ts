// src/lib/rbac.ts
export type Role =
  | "ADMIN"
  | "FLEET_MANAGER"
  | "DRIVER"
  | "SAFETY_OFFICER"
  | "FINANCIAL_ANALYST";

export const ROUTE_PERMISSIONS: Record<string, Role[]> = {
  "/dashboard": ["ADMIN", "FLEET_MANAGER", "DRIVER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"],
  "/vehicles": ["ADMIN", "FLEET_MANAGER"],
  "/drivers": ["ADMIN", "FLEET_MANAGER", "SAFETY_OFFICER"],
  "/trips": ["ADMIN", "FLEET_MANAGER"],
  "/my-trips": ["DRIVER"],
  "/maintenance": ["ADMIN", "FLEET_MANAGER", "SAFETY_OFFICER"],
  "/fuel-expenses": ["ADMIN", "FLEET_MANAGER", "FINANCIAL_ANALYST"],
  "/reports": ["ADMIN", "FLEET_MANAGER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"],
  "/settings": ["ADMIN"],
};

export function canAccess(role: Role, route: string): boolean {
  const allowed = ROUTE_PERMISSIONS[route];
  if (!allowed) return false;
  return allowed.includes(role);
}
