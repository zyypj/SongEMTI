import { prisma } from "@/lib/prisma";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/src/lib/auth/options";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = (await getServerSession(authOptions as any)) as Session | null;
  if (!session?.user?.email) return new Response("unauth", { status: 401 });

  const { videoId } = await req.json().catch(() => ({}));
  if (!videoId) return new Response("videoId required", { status: 400 });

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

  const track = await prisma.track.findUnique({ where: { videoId }, select: { id: true } });
  if (!track) return new Response("not found", { status: 404 });

  await prisma.playlistItem.deleteMany({
    where: { playlistId: params.id, trackId: track.id },
  });

  return new Response(null, { status: 204 });
}
