import { NextRequest } from "next/server";

const BASE = "https://www.songsterr.com/a/ra";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q) return Response.json({ items: [] }, { status: 200 });

  const url = `${BASE}/songs.json?pattern=${encodeURIComponent(q)}`;

  const r = await fetch(url, { next: { revalidate: 60 } });
  if (!r.ok) return Response.json({ items: [] }, { status: 200 });

  const data: any[] = await r.json();

  const items = data.map((s: any) => {
    const artist = s.artist?.name || s.artist?.nameWithoutThe || "";
    const title = s.title || "";
    const slugArtist = (artist || "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
    const slugTitle  = (title  || "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
    const id = s.id;
    const page = `https://www.songsterr.com/a/wsa/${slugArtist}-${slugTitle}-tab-s${id}`;

    const thumb = `https://img.youtube.com/vi/undefined/mqdefault.jpg`;

    return {
      id,
      title,
      artist,
      page,
      thumb,
      tracks: s.tracks || []
    };
  });

  return Response.json({ items });
}
