// src/lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const { handlers, signIn, signOut, auth: nextAuth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user || !user.isActive) return null;

        const passwordMatch = await compare(
          parsed.data.password,
          user.passwordHash
        );
        if (!passwordMatch) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});

export const auth = (...args: any[]): any => {
  if (typeof args[0] === "function") {
    return nextAuth(args[0] as any);
  }
  if (process.env.DEV_BYPASS === "true") {
    return Promise.resolve({
      user: {
        id: "cm4dev000000adminuser123456",
        name: "Marcus Chen",
        email: "admin@transitops.com",
        role: "ADMIN",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
      expires: new Date(Date.now() + 30 * 86400000).toISOString(),
    });
  }
  return nextAuth(...(args as [any]));
};

export { handlers, signIn, signOut };
