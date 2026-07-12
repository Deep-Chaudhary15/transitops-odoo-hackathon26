// src/middleware.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { ROUTE_PERMISSIONS } from "@/lib/rbac";
import type { Role } from "@/lib/rbac";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // 1. If hitting /login and logged in, redirect to /dashboard
  if (pathname === "/login" && session?.user) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 2. Allow API auth routes, static files, and login page
  const isPublicRoute =
    pathname === "/login" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.includes("favicon.ico") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg");

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 3. Not authenticated → redirect to /login
  // if (!session?.user) {
  //   return NextResponse.redirect(new URL("/login", req.url));
  // }

  // 4. Role-Based Access Control (RBAC) checking
  const userRole = (session.user as any).role as Role;

  // Find if current path is restricted
  const matchedRoute = Object.keys(ROUTE_PERMISSIONS).find(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (matchedRoute) {
    const allowedRoles = ROUTE_PERMISSIONS[matchedRoute];
    if (!allowedRoles.includes(userRole)) {
      // Forbidden: Redirect to dashboard with error parameter
      return NextResponse.redirect(
        new URL("/dashboard?error=unauthorized", req.url)
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  // Run middleware on all paths except static assets
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
