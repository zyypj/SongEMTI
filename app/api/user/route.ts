import { prisma } from "@/lib/prisma";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcrypt";

export async function GET() {
  const session = (await getServerSession(authOptions as any)) as Session | null;
  const email = session?.user?.email;
  if (!email) return new Response("unauth", { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email },
    select: { email: true, name: true, username: true, image: true },
  });
  if (!user) return new Response("unauth", { status: 401 });

  return Response.json(user);
}

export async function PATCH(req: Request) {
  const session = (await getServerSession(authOptions as any)) as Session | null;
  const email = session?.user?.email;
  if (!email) return new Response("unauth", { status: 401 });

  const body = await req.json().catch(() => ({} as any));
  const { name, username, image, email: newEmail } = body || {};

  if (username && !/^[a-zA-Z0-9._-]{3,32}$/.test(username)) {
    return new Response("username inválido", { status: 400 });
  }
  if (newEmail && !/^\S+@\S+\.\S+$/.test(newEmail)) {
    return new Response("email inválido", { status: 400 });
  }

  try {
    const updated = await prisma.user.update({
      where: { email },
      data: {
        name: name ?? undefined,
        username: username ?? undefined,
        image: image ?? undefined,
        email: newEmail ?? undefined,
      },
      select: { email: true, name: true, username: true, image: true },
    });
    return Response.json(updated);
  } catch (e: any) {
    console.error("PATCH /api/user error:", e);
    if (String(e?.code) === "P2002") return new Response("username ou email já em uso", { status: 409 });
    if (String(e?.code) === "P2000") return new Response("imagem muito grande", { status: 413 });
    return new Response("erro ao atualizar", { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = (await getServerSession(authOptions as any)) as Session | null;
  const email = session?.user?.email;
  if (!email) return new Response("unauth", { status: 401 });

  const { currentPassword, newPassword } = await req.json().catch(() => ({} as any));
  if (!currentPassword || !newPassword) return new Response("dados incompletos", { status: 400 });
  if (String(newPassword).length < 6) return new Response("senha muito curta", { status: 400 });

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, password: true } });
  if (!user) return new Response("unauth", { status: 401 });

  const ok = await bcrypt.compare(String(currentPassword), user.password);
  if (!ok) return new Response("senha atual incorreta", { status: 400 });

  const hash = await bcrypt.hash(String(newPassword), 10);
  await prisma.user.update({ where: { id: user.id }, data: { password: hash } });

  return new Response(null, { status: 204 });
}
