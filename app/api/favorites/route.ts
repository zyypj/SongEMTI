import { prisma } from "@/lib/prisma";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/src/lib/auth/options";

export async function GET() {
  const session = (await getServerSession(authOptions)) as Session | null;
  const email = session?.user?.email;
  if (!email) return new Response("unauth", { status: 401 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return new Response("unauth", { status: 401 });

  const favs = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: { track: true },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(favs.map(f => f.track));
}

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions)) as Session | null;
  const email = session?.user?.email;
  if (!email) return new Response("unauth", { status: 401 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return new Response("unauth", { status: 401 });

  const body = await req.json().catch(() => null) as any;
  const track = body?.track;
  if (!track?.videoId) return new Response("bad request", { status: 400 });

  const t = await prisma.track.upsert({
    where: { videoId: track.videoId },
    update: { title: track.title, channel: track.channel, thumb: track.thumb },
    create: { videoId: track.videoId, title: track.title, channel: track.channel, thumb: track.thumb },
  });

  const existing = await prisma.favorite.findUnique({
    where: { userId_trackId: { userId: user.id, trackId: t.id } } as any,
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return new Response("unfavorited");
  } else {
    await prisma.favorite.create({ data: { userId: user.id, trackId: t.id } });
    return new Response("favorited");
  }
}
