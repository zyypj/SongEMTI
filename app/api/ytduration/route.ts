import { parseYouTubeDuration } from "@/lib/yt";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const ids = (url.searchParams.get("ids") || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  if (!ids.length) return new Response("ids required", { status: 400 });

  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return new Response("missing YOUTUBE_API_KEY", { status: 500 });

  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 50) chunks.push(ids.slice(i, i + 50));

  const out: Record<string, number> = {};
  for (const chunk of chunks) {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${encodeURIComponent(
        chunk.join(",")
      )}&key=${key}`
    );
    if (!res.ok) continue;
    const json = await res.json();
    for (const item of json.items || []) {
      const vid = item.id as string;
      const iso = item.contentDetails?.duration as string | undefined;
      out[vid] = iso ? parseYouTubeDuration(iso) : 0;
    }
  }

  return Response.json(out);
}
