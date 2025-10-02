import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  const { email, password, name } = await req.json();
  if (!email || !password) return new Response("Missing fields", { status: 400 });
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return new Response("Email already in use", { status: 400 });
  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { email, password: hashed, name } });
  return new Response("ok");
}
