"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        router.refresh();
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Quick login helper for demo/testing
  const handleQuickLogin = async (roleEmail: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await signIn("credentials", {
        email: roleEmail,
        password: "password123",
        redirect: false,
      });

      if (res?.error) {
        setError("Failed to auto-login. Check if DB is seeded.");
      } else {
        router.refresh();
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Auto-login error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fbf8ff]">
      {/* Left side: Brand Showcase */}
      <div className="flex-1 bg-[#ededfb] flex flex-col justify-between p-12 text-[#191b25]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0052ff] rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined font-bold">local_shipping</span>
          </div>
          <div>
            <h1 className="font-bold text-xl leading-tight">TransitOps</h1>
            <p className="text-xs text-[#505f76] leading-none">Enterprise Fleet Platform</p>
          </div>
        </div>

        <div className="my-auto max-w-md space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight text-[#191b25]">
            Simplify your logistics management workflows.
          </h2>
          <p className="text-[#505f76] text-sm">
            Monitor real-time vehicle statuses, manage driver schedules, dispatch trips, and automate maintenance updates from a single centralized console.
          </p>

          {/* Quick Login profiles (useful for testing/demo) */}
          <div className="mt-8 pt-6 border-t border-[#c3c5d9]/40">
            <p className="text-xs font-bold text-[#505f76] uppercase tracking-wider mb-3">Quick Login (Seeded Accounts)</p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin("admin@transitops.com")}
                className="px-3 py-2 bg-white hover:bg-[#0052ff]/5 border border-[#c3c5d9] rounded-lg text-left text-xs font-semibold text-[#191b25] transition-all cursor-pointer shadow-sm hover:border-[#0052ff]"
              >
                💼 Admin User
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("manager@transitops.com")}
                className="px-3 py-2 bg-white hover:bg-[#0052ff]/5 border border-[#c3c5d9] rounded-lg text-left text-xs font-semibold text-[#191b25] transition-all cursor-pointer shadow-sm hover:border-[#0052ff]"
              >
                🚚 Fleet Manager
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("driver@transitops.com")}
                className="px-3 py-2 bg-white hover:bg-[#0052ff]/5 border border-[#c3c5d9] rounded-lg text-left text-xs font-semibold text-[#191b25] transition-all cursor-pointer shadow-sm hover:border-[#0052ff]"
              >
                🧭 Driver Profile
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("safety@transitops.com")}
                className="px-3 py-2 bg-white hover:bg-[#0052ff]/5 border border-[#c3c5d9] rounded-lg text-left text-xs font-semibold text-[#191b25] transition-all cursor-pointer shadow-sm hover:border-[#0052ff]"
              >
                🛡️ Safety Officer
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-[#737688]">© 2026 TransitOps Operations, Inc. All rights reserved.</p>
      </div>

      {/* Right side: Login form */}
      <div className="flex-1 flex items-center justify-center p-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold text-[#191b25] tracking-tight">Sign in to your account</h2>
            <p className="text-sm text-[#505f76] mt-2">Enter your credentials below to log in.</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-[#505f76] uppercase tracking-wider">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@transitops.com"
                className="w-full bg-white border border-[#c3c5d9] rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0052ff]/20 focus:border-[#0052ff] transition-all outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-bold text-[#505f76] uppercase tracking-wider">
                  Password
                </label>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-[#c3c5d9] rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0052ff]/20 focus:border-[#0052ff] transition-all outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#0052ff] hover:bg-[#003ec7] text-white rounded-lg text-sm font-bold shadow transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
