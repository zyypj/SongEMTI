import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        if (!creds?.email || !creds.password) return null;
        const user = await prisma.user.findUnique({ where: { email: String(creds.email) } });
        if (!user) return null;
        const ok = await bcrypt.compare(String(creds.password), user.password);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name || undefined };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // sanitize
      delete (token as any).image;
      delete (token as any).picture;

      if (trigger === "update" && session) {
        if (session.name !== undefined) token.name = session.name;
        if ((session as any).username !== undefined) (token as any).username = (session as any).username;
        if (session.email !== undefined) token.email = session.email;
      }

      const email = user?.email || token.email;
      if (email) {
        const dbUser = await prisma.user.findUnique({
          where: { email },
          select: { name: true, username: true },
        });
        if (dbUser) {
          token.name = dbUser.name ?? token.name;
          (token as any).username = dbUser.username ?? (token as any).username;
        }
      }

      for (const k of Object.keys(token)) {
        const v = (token as any)[k];
        if (typeof v === "string" && v.length > 1000) delete (token as any)[k];
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = (token.name as string) ?? session.user.name;
        (session.user as any).username = (token as any).username ?? (session.user as any).username;
      }
      return session;
    },
  },
  pages: { signIn: "/login", error: "/login" },
};

export default authOptions;