import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions = {
  session: { strategy: "jwt" as const, maxAge: 60 * 60 * 24 * 30 },
  providers: [
    Credentials({
      name: "credentials",
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        if (!creds?.email || !creds.password) return null;
        const user = await prisma.user.findUnique({ where: { email: String(creds.email) }});
        if (!user) return null;
        const ok = await bcrypt.compare(String(creds.password), user.password);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name || undefined };
      }
    })
  ],
  pages: {
    signIn: "/login",
    error: "/login"
  }
};

const handler = NextAuth(authOptions as any);
export { handler as GET, handler as POST };
