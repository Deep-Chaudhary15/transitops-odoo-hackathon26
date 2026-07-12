import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";
import type { Role } from "@/lib/rbac";

export default async function VehiclesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // If not authenticated, redirect to login
  if (!session?.user) {
    redirect("/login");
  }

  const user = {
    name: session.user.name || "User",
    email: session.user.email || "",
    role: (session.user as any).role as Role,
    image: session.user.image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  };

  return (
    <div className="flex overflow-hidden h-screen bg-[#fbf8ff]">
      {/* Sidebar Navigation */}
      <Sidebar user={user} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-16 sticky top-0 z-50 w-full bg-white border-b border-[#e1e1ef] flex justify-between items-center px-6 shrink-0">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737688]" style={{ fontSize: "20px" }}>
                search
              </span>
              <input
                className="w-full bg-[#f3f2ff] border border-[#c3c5d9] rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#0052ff]/20 focus:border-[#0052ff] transition-all outline-none"
                placeholder="Search vehicles, routes, or drivers..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-[#434656] hover:bg-[#ededfb] transition-all">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-[#434656] hover:bg-[#ededfb] transition-all">
              <span className="material-symbols-outlined">help_outline</span>
            </button>
            <div className="h-8 w-[1px] bg-[#e1e1ef] mx-2"></div>
            <div className="flex items-center gap-2 cursor-pointer group select-none">
              <span className="text-sm font-medium text-[#191b25]">Global Fleet</span>
              <span className="material-symbols-outlined text-[#737688] group-hover:text-[#0052ff] transition-colors">
                keyboard_arrow_down
              </span>
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1440px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
