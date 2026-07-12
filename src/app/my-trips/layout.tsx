import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";
import type { Role } from "@/lib/rbac";

export default async function MyTripsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = {
    name: session.user.name || "Marcus Chen",
    email: session.user.email || "admin@fleetops.logistics",
    role: ((session.user as any).role || "DRIVER") as Role,
    image: session.user.image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  };

  return (
    <div className="flex min-h-screen bg-[#fbf8ff]">
      <Sidebar user={user} />
      <div className="flex-1 min-w-0 bg-[#fbf8ff] flex flex-col">
        <header className="h-[64px] sticky top-0 z-50 w-full bg-[#fbf8ff] border-b border-[#c3c5d9]">
          <div className="flex justify-between items-center px-[24px] h-full max-w-[1440px] mx-auto">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative w-full max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737688] text-sm">search</span>
                <input
                  className="w-full bg-[#f3f2ff] border border-[#c3c5d9] rounded-full py-2 pl-10 pr-4 text-[13px] font-medium focus:ring-2 focus:ring-[#003ec7]/20 focus:border-[#003ec7] transition-all outline-none"
                  placeholder="Search my active routes, manifests, checkpoints..."
                  type="text"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                HOS Compliant (8.4h left)
              </span>
              <button className="w-10 h-10 flex items-center justify-center rounded-full text-[#505f76] hover:bg-[#e7e7f5] transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <div className="h-8 w-[1px] bg-[#c3c5d9] mx-2"></div>
              <span className="font-label-md text-label-md text-[#003ec7] font-bold">FleetOps v2.4.0</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
