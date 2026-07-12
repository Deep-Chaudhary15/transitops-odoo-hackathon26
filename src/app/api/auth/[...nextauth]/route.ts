// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
export const runtime = "nodejs"; // Or "edge" if using edge-compatible DB driver
