import { NextRequest } from "next/server";

const CDN_HOST = "dqsljvtekg760.cloudfront.net";
const VALID_PATH = /^\/\d+\/\d+\/[A-Za-z0-9\-_]+\/0\.json$/;

export async function GET(req: NextRequest) {
  const p = new URL(req.url).searchParams.get("path") || "";
  try {
    const url = new URL("https://" + CDN_HOST + p);
    if (url.hostname !== CDN_HOST || !VALID_PATH.test(url.pathname)) {
      return Response.json({ ok: false }, { status: 400 });
    }
    const r = await fetch(url.toString(), {
      headers: { "accept": "application/json", "referer": "https://www.songsterr.com/" },
      cache: "no-store",
    });
    if (!r.ok) return Response.json({ ok: false }, { status: 200 });
    const json = await r.json();
    return Response.json({ ok: true, json });
  } catch {
    return Response.json({ ok: false }, { status: 200 });
  }
}
