import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any);
  if (!session?.user?.email) return new Response("unauth", { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email }});
  const { track, value } = await req.json();
  if (!track?.videoId || !["LIKE","DISLIKE","NONE"].includes(value)) return new Response("bad request", { status: 400 });

  const t = await prisma.track.upsert({
    where: { videoId: track.videoId },
    update: { title: track.title, channel: track.channel, thumb: track.thumb },
    create: { videoId: track.videoId, title: track.title, channel: track.channel, thumb: track.thumb }
  });

  await prisma.rating.upsert({
    where: { userId_trackId: { userId: user!.id, trackId: t.id } } as any,
    update: { value },
    create: { userId: user!.id, trackId: t.id, value }
  });

  return new Response("ok");
}
