import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(req: Request, { params }: { params: { id: string }}) {
  const session = await getServerSession(authOptions as any);
  if (!session?.user?.email) return new Response("unauth", { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  if (!user) return new Response("unauth", { status: 401 });

  const { name } = await req.json();
  if (!name || typeof name !== "string") return new Response("name required", { status: 400 });

  const updated = await prisma.playlist.update({
    where: { id: params.id, userId: user.id } as any,
    data: { name }
  }).catch(() => null);

  if (!updated) return new Response("not found", { status: 404 });
  return Response.json({ ok: true });
}
