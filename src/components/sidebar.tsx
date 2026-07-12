"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";
import type { Role } from "@/lib/rbac";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: Role;
    image?: string | null;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Filter navigation items based on user role
  const allowedNavItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <aside
      className={cn(
        "h-screen sticky left-0 top-0 flex flex-col py-4 bg-white border-r border-[#e1e1ef] transition-all duration-300 ease-in-out shrink-0",
        isCollapsed ? "w-20" : "w-[260px]"
      )}
    >
      {/* Brand Header */}
      <div className="px-6 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 bg-[#0052ff] rounded-lg flex items-center justify-center text-white shrink-0">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              local_shipping
            </span>
          </div>
          {!isCollapsed && (
            <div className="transition-opacity duration-200">
              <h1 className="font-semibold text-lg text-[#191b25] leading-tight">FleetOps</h1>
              <p className="text-xs text-[#505f76] leading-none">Enterprise Logistics</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-6 h-6 rounded-full hover:bg-[#ededfb] flex items-center justify-center text-[#505f76]"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <span className="material-symbols-outlined text-sm">
            {isCollapsed ? "chevron_right" : "chevron_left"}
          </span>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
        {allowedNavItems
          .filter((item) => item.key !== "settings")
          .map((item) => {
            const isActive = pathname.startsWith(item.href);
            // Convert Lucide icon names to Material Symbols names mapping
            const symbolMap: Record<string, string> = {
              dashboard: "dashboard",
              vehicles: "local_shipping",
              drivers: "person",
              trips: "route",
              maintenance: "build",
              fuel: "local_gas_station",
              expenses: "credit_card",
              reports: "assessment",
            };
            const symbolName = symbolMap[item.key] || "circle";

            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all group relative",
                  isActive
                    ? "bg-[#0052ff]/10 text-[#0052ff] border-l-2 border-[#0052ff]"
                    : "text-[#505f76] hover:bg-[#ededfb] hover:text-[#191b25]"
                )}
              >
                <span className="material-symbols-outlined shrink-0">
                  {symbolName}
                </span>
                {!isCollapsed && (
                  <span className="text-sm transition-opacity duration-200">
                    {item.label}
                  </span>
                )}
                {isCollapsed && (
                  <span className="absolute left-16 bg-[#191b25] text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
      </nav>

      {/* Settings fixed at the bottom */}
      {allowedNavItems.find((item) => item.key === "settings") && (() => {
        const item = allowedNavItems.find((item) => item.key === "settings")!;
        const isActive = pathname.startsWith(item.href);
        return (
          <div className="px-3 border-t border-[#e1e1ef] pt-3">
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all group relative",
                isActive
                  ? "bg-[#0052ff]/10 text-[#0052ff] border-l-2 border-[#0052ff]"
                  : "text-[#505f76] hover:bg-[#ededfb] hover:text-[#191b25]"
              )}
            >
              <span className="material-symbols-outlined shrink-0">
                settings
              </span>
              {!isCollapsed && (
                <span className="text-sm transition-opacity duration-200">
                  {item.label}
                </span>
              )}
              {isCollapsed && (
                <span className="absolute left-16 bg-[#191b25] text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {item.label}
                </span>
              )}
            </Link>
          </div>
        );
      })()}

      {/* User Footer Profile */}
      <div className="px-4 pt-4 border-t border-[#e1e1ef] mt-2">
        <div className={cn("flex items-center gap-3", isCollapsed ? "justify-center" : "")}>
          <img
            className="w-10 h-10 rounded-full border border-[#e1e1ef] shrink-0"
            src={user.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"}
            alt={user.name}
          />
          {!isCollapsed && (
            <div className="overflow-hidden transition-opacity duration-200">
              <p className="text-sm font-semibold text-[#191b25] truncate">{user.name}</p>
              <p className="text-xs text-[#505f76] truncate capitalize">
                {user.role.replace("_", " ").toLowerCase()}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
