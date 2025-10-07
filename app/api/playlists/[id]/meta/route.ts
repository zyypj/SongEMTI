import { prisma } from "@/lib/prisma";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/src/lib/auth/options";

export async function GET(
  _req: Request,
  ctx: { params: { id: string } }
) {
  const { params } = ctx;
  const session = (await getServerSession(authOptions)) as Session | null;
  const email = session?.user?.email;
  if (!email) return new Response("unauth", { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!user) return new Response("unauth", { status: 401 });

  const pl = await prisma.playlist.findFirst({
    where: { id: params.id, userId: user.id },
    select: { id: true, name: true, createdAt: true },
  });
  if (!pl) return new Response("not found", { status: 404 });

  return Response.json(pl);
}
