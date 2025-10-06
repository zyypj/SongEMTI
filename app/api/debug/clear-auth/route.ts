function expireCookie(name: string, opts = "Path=/; Max-Age=0; HttpOnly; SameSite=Lax") {
  return `${name}=; ${opts}`;
}

export async function GET() {
  const cookies = [
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.csrf-token",
    "__Host-next-auth.csrf-token",
    "next-auth.callback-url",
    "__Secure-next-auth.callback-url",
  ];

  const res = new Response("cleared", { status: 200 });
  cookies.forEach((n) => res.headers.append("Set-Cookie", expireCookie(n)));
  return res;
}
