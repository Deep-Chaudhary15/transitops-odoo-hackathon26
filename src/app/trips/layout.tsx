import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";
import type { Role } from "@/lib/rbac";
import Link from "next/link";

export default async function TripsLayout({
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
          {/* Left Side: Back Arrow and Breadcrumbs */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#505f76] hover:bg-[#ededfb] transition-all hover:text-[#191b25]"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                arrow_back
              </span>
            </Link>
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Link href="/trips" className="text-[#505f76] hover:text-[#0052ff] transition-colors">
                Trips
              </Link>
              <span className="text-[#c3c5d9] font-normal">/</span>
              <span className="text-[#191b25] font-semibold">TRP-882910</span>
            </div>
          </div>

          {/* Right Side: Global Search and System Actions */}
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737688]" style={{ fontSize: "18px" }}>
                search
              </span>
              <input
                className="w-full bg-[#f3f2ff] border border-[#c3c5d9] rounded-lg pl-9 pr-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-[#0052ff]/20 focus:border-[#0052ff] transition-all outline-none text-[#191b25] placeholder-[#737688]"
                placeholder="Search tracking ID..."
                type="text"
              />
            </div>
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-[#434656] hover:bg-[#ededfb] transition-all relative">
              <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#ef4444] rounded-full border border-white"></span>
            </button>
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-[#434656] hover:bg-[#ededfb] transition-all">
              <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>help_outline</span>
            </button>
            <div className="h-6 w-[1px] bg-[#e1e1ef] mx-1"></div>
            <div className="flex items-center gap-2 cursor-pointer group select-none">
              <img
                className="w-8 h-8 rounded-full border border-[#e1e1ef] object-cover shrink-0"
                src={user.image}
                alt={user.name}
              />
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#f8f9fc]">
          <div className="max-w-[1440px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
