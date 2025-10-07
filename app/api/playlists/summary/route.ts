import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/options";

export async function GET() {
  const session = (await getServerSession(authOptions)) as import("next-auth").Session | null;
  if (!session?.user?.email) return new Response("unauth", { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  if (!user) return new Response("unauth", { status: 401 });

  const lists = await prisma.playlist.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { items: true } },
      items: {
        include: { track: { select: { thumb: true } } },
        orderBy: { addedAt: "asc" },
        take: 4
      }
    }
  });

  const data = lists.map(pl => ({
    id: pl.id,
    name: pl.name,
    createdAt: pl.createdAt,
    count: pl._count.items,
    covers: pl.items.map(it => it.track.thumb).filter(Boolean)
  }));

  return Response.json(data);
}
