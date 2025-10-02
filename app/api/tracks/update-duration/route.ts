import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { videoId, title, channel, thumb, durationSec } = await req.json();
  if (!videoId) return new Response("videoId required", { status: 400 });
  const track = await prisma.track.upsert({
    where: { videoId },
    update: { title, channel, thumb, durationSec: typeof durationSec === "number" ? durationSec : undefined },
    create: { videoId, title, channel, thumb, durationSec: typeof durationSec === "number" ? durationSec : 0 },
  });
  return Response.json(track);
}
