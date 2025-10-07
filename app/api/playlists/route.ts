import { prisma } from "@/lib/prisma";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/src/lib/auth/options";
export async function GET() {
  const session = (await getServerSession(authOptions as any)) as Session | null;
  const email = session?.user?.email;
  if (!email) return new Response("unauth", { status: 401 });

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) return new Response("unauth", { status: 401 });

  const lists = await prisma.playlist.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(lists);
}

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions as any)) as Session | null;
  const email = session?.user?.email;
  if (!email) return new Response("unauth", { status: 401 });

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) return new Response("unauth", { status: 401 });

  const { name } = await req.json();
  if (!name) return new Response("name required", { status: 400 });

  const pl = await prisma.playlist.create({ data: { name, userId: user.id } });
  return Response.json(pl);
}
