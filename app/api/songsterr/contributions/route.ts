import { NextRequest } from "next/server";

const ORIGIN = "https://www.songsterr.com";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const songId = searchParams.get("songId");
  if (!songId) return Response.json({ items: [] }, { status: 200 });

  const cookie = req.headers.get("cookie") ?? "";

  const url = `${ORIGIN}/api/contributions/songs?songId=${encodeURIComponent(songId)}`;

  const r = await fetch(url, {
    headers: {
      cookie,
      "accept": "application/json, */*",
      "referer": `${ORIGIN}/a/wsa/_/tab-s${songId}`,
    },
    cache: "no-store",
  });

  if (r.status === 401 || r.status === 403) {
    return Response.json({ items: [], needsAuth: true }, { status: 200 });
  }

  if (!r.ok) return Response.json({ items: [] }, { status: 200 });

  const data = await r.json();
  return Response.json({ items: data });
}
