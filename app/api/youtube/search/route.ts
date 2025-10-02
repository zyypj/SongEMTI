import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  const key = process.env.YOUTUBE_API_KEY;
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "12");
  url.searchParams.set("q", q);
  url.searchParams.set("key", key!);
  const r = await fetch(url.toString(), { cache: "no-store" });
  const data = await r.json();
  return Response.json(data);
}
