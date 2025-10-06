import { prisma } from "@/lib/prisma";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

export const authOptions = {
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
    async jwt({ token, user, trigger, session }: any) {
      delete (token as any).image;
      delete (token as any).picture;

      if (trigger === "update" && session) {
        if (session.name !== undefined) token.name = session.name;
        if (session.username !== undefined) token.username = session.username;
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
          token.username = dbUser.username ?? token.username;
        }
      }

      for (const k of Object.keys(token)) {
        const v = (token as any)[k];
        if (typeof v === "string" && v.length > 1000) delete (token as any)[k];
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.name = token.name ?? session.user.name;
        (session.user as any).username = token.username ?? (session.user as any).username;
      }
      return session;
    },
  },
  pages: { signIn: "/login", error: "/login" }
};

const handler = NextAuth(authOptions as any);
export { handler as GET, handler as POST };
