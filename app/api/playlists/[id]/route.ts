import { prisma } from "@/lib/prisma";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = (await getServerSession(authOptions as any)) as Session | null;
  if (!session?.user?.email) return new Response("unauth", { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  });
  if (!user) return new Response("unauth", { status: 401 });

  const pl = await prisma.playlist.findFirst({
    where: { id: params.id, userId: user.id },
    select: { id: true },
  });
  if (!pl) return new Response("not found", { status: 404 });

  const items = await prisma.playlistItem.findMany({
    where: { playlistId: params.id },
    include: { track: true },
    orderBy: { addedAt: "asc" },
  });

  const tracks = items.map(it => ({
    videoId: it.track.videoId,
    title: it.track.title,
    channel: it.track.channel,
    thumb: it.track.thumb,
    durationSec: (it.track as any).durationSec ?? 0,
  }));

  return Response.json(tracks);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = (await getServerSession(authOptions as any)) as Session | null;
  if (!session?.user?.email) return new Response("unauth", { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  });
  if (!user) return new Response("unauth", { status: 401 });

  const exists = await prisma.playlist.findFirst({
    where: { id: params.id, userId: user.id },
    select: { id: true },
  });
  if (!exists) return new Response("not found", { status: 404 });

  await prisma.playlistItem.deleteMany({ where: { playlistId: params.id } });
  await prisma.playlist.delete({ where: { id: params.id } });

  return new Response(null, { status: 204 });
}
