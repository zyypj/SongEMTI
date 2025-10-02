import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(_: Request, { params }: { params: { id: string }}) {
  const session = await getServerSession(authOptions as any);
  if (!session?.user?.email) return new Response("unauth", { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  if (!user) return new Response("unauth", { status: 401 });

  const pl = await prisma.playlist.findFirst({
    where: { id: params.id, userId: user.id },
    select: { id: true, name: true, createdAt: true }
  });
  if (!pl) return new Response("not found", { status: 404 });

  return Response.json(pl);
}
