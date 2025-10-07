import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/options";

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions)) as import("next-auth").Session | null;
  if (!session?.user?.email) return new Response("unauth", { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email }});
  const { playlistId, track } = await req.json();
  if (!playlistId || !track?.videoId) return new Response("bad request", { status: 400 });

  const pl = await prisma.playlist.findFirst({ where: { id: playlistId, userId: user!.id }});
  if (!pl) return new Response("not found", { status: 404 });

  const t = await prisma.track.upsert({
    where: { videoId: track.videoId },
    update: { title: track.title, channel: track.channel, thumb: track.thumb },
    create: { videoId: track.videoId, title: track.title, channel: track.channel, thumb: track.thumb }
  });

  await prisma.playlistItem.upsert({
    where: { playlistId_trackId: { playlistId, trackId: t.id }},
    update: {},
    create: { playlistId, trackId: t.id }
  });

  return new Response("ok");
}
