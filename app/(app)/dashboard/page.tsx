"use client";
import { useEffect, useState } from "react";
import Topbar from "@/components/Topbar";
import TrackCard from "@/components/TrackCard";
import SongsterrPanel from "@/components/SongsterrPanel";
import TabCard from "@/components/TabCard";
import { usePlayer } from "@/hooks/usePlayer";

type Track = { videoId: string; title: string; channel: string; thumb: string };
type TabItem = { id: number; title: string; artist: string; page: string; thumb?: string };

function normalizeYouTube(items: any[]): Track[] {
  return (items || [])
    .map((x: any) => {
      const videoId =
        x?.id?.videoId ||
        (typeof x?.id === "string" ? x.id : x?.contentDetails?.videoId) ||
        "";
      const title = x?.snippet?.title || "";
      const channel = x?.snippet?.channelTitle || "";
      const thumb =
        x?.snippet?.thumbnails?.medium?.url ||
        x?.snippet?.thumbnails?.default?.url ||
        (videoId ? `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg` : "");
      return { videoId, title, channel, thumb };
    })
    .filter((t) => !!t.videoId);
}

/** Limpa ruídos comuns de títulos do YouTube para buscar no Songsterr */
function cleanForSongsterr(q: string): string {
  let s = q.trim();

  // remove partes entre parênteses/chaves/colchetes
  s = s.replace(/\([^)]*\)/g, " ").replace(/\[[^\]]*\]/g, " ").replace(/\{[^}]*\}/g, " ");

  // normaliza separadores e espaços
  s = s.replace(/[-–—]+/g, "-").replace(/\s+/g, " ").trim();

  // termos comuns que poluem
  const noise = [
    "official video", "official audio", "official", "video", "audio",
    "lyrics", "lyric video", "visualizer", "hd", "4k", "remastered",
    "live", "cover", "guitar cover", "drum cover", "bass cover",
    "full album", "topic"
  ];
  const lower = s.toLowerCase();
  noise.forEach(term => {
    const re = new RegExp(`\\b${term}\\b`, "gi");
    s = s.replace(re, " ");
  });

  // remove " - topic" (muito comum)
  s = s.replace(/\s-\s*topic\b/i, " ");

  // espaços extras
  s = s.replace(/\s+/g, " ").trim();

  // tira hífen nas pontas
  s = s.replace(/^-\s*/, "").replace(/\s*-\s*$/, "");

  return s;
}

/** Gera variações de consulta como um usuário faria */
function buildSongsterrQueries(raw: string): string[] {
  const base = cleanForSongsterr(raw);

  // se tiver "Artista - Música"
  const dashMatch = base.split(/\s-\s/);
  const variants = new Set<string>();

  // 1) original limpo
  if (base) variants.add(base);

  // 2) se houver artista - título, gera variações
  if (dashMatch.length >= 2) {
    const artist = dashMatch[0].trim();
    const title = dashMatch.slice(1).join(" - ").trim();

    if (artist && title) {
      variants.add(`${artist} - ${title}`);     // padrão humano
      variants.add(`${artist} ${title}`);       // sem hífen
      variants.add(title);                      // só título
      variants.add(artist);                     // só artista
    }
  } else {
    // sem hífen, tenta separar por " - " que viria de outra limpeza
    variants.add(base);
  }

  // 3) heurística extra: se tiver " - " ainda, divide na primeira ocorrência
  const firstDash = base.indexOf(" - ");
  if (firstDash > -1) {
    const a = base.slice(0, firstDash).trim();
    const t = base.slice(firstDash + 3).trim();
    if (a && t) {
      variants.add(`${a} - ${t}`);
      variants.add(`${a} ${t}`);
      variants.add(t);
      variants.add(a);
    }
  }

  // Mantém ordem previsível
  return Array.from(variants).filter(Boolean).slice(0, 6);
}

/** Tenta buscar no Songsterr com variações até obter algum resultado */
async function searchSongsterrUserLike(query: string): Promise<TabItem[]> {
  const tries = buildSongsterrQueries(query);

  for (const q of tries) {
    try {
      const r = await fetch(`/api/songsterr/search?q=${encodeURIComponent(q)}`);
      if (!r.ok) continue;
      const j = await r.json();
      const items = (j?.items || []) as TabItem[];
      if (items.length) return items;
    } catch {
      // tenta a próxima
    }
  }
  return [];
}

export default function Dashboard() {
  const { /* setQueue, play */ } = usePlayer();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"youtube" | "tabs">("youtube");

  const [ytItems, setYtItems] = useState<Track[]>([]);
  const [tabItems, setTabItems] = useState<TabItem[]>([]);

  const [panelOpen, setPanelOpen] = useState(false);
  const [panelSeedQuery, setPanelSeedQuery] = useState<string>("");

  const search = async (query: string) => {
    const qq = query.trim();
    if (!qq) return;
    setQ(qq);

    // YouTube
    try {
      const r = await fetch(`/api/youtube/search?q=${encodeURIComponent(qq)}`);
      const data = await r.json();
      setYtItems(normalizeYouTube(data.items));
    } catch {
      setYtItems([]);
    }

    // Songsterr (modo usuário: tenta múltiplas variantes)
    try {
      const items = await searchSongsterrUserLike(qq);
      setTabItems(items);
    } catch {
      setTabItems([]);
    }
  };

  useEffect(() => {
    search("Metallica - Topic");
  }, []);

  const openPanelWithQuery = (seed: string) => {
    setPanelSeedQuery(seed);
    setPanelOpen(true);
  };

  return (
    <>
      <Topbar onSearch={search} />

      {/* Abas */}
      <div className="px-6 pt-4">
        <div className="inline-flex rounded-full border border-white/10 bg-white/5 overflow-hidden">
          <button
            className={`px-4 py-1.5 text-sm transition ${tab === "youtube" ? "bg-emerald-600" : "hover:bg-white/10"}`}
            onClick={() => setTab("youtube")}
          >
            YouTube
          </button>
          <button
            className={`px-4 py-1.5 text-sm transition ${tab === "tabs" ? "bg-emerald-600" : "hover:bg-white/10"}`}
            onClick={() => setTab("tabs")}
          >
            Tabs
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-6 space-y-8">
        {tab === "youtube" && (
          <section>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-xl font-semibold">
                Resultados do YouTube {q && <span className="opacity-60">“{q}”</span>}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {ytItems.map((t, i) => (
                <TrackCard key={t.videoId} t={t} index={i} all={ytItems} />
              ))}
              {!ytItems.length && (
                <div className="opacity-60 col-span-full">Nenhum resultado do YouTube.</div>
              )}
            </div>
          </section>
        )}

        {tab === "tabs" && (
          <section>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-xl font-semibold">
                Tabs do Songsterr {q && <span className="opacity-60">“{q}”</span>}
              </h2>
              {!!tabItems.length && (
                <button
                  className="text-sm px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20"
                  onClick={() => openPanelWithQuery(q)}
                  title="Abrir viewer de tablaturas com esta busca"
                >
                  Abrir viewer
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tabItems.map((item) => (
                <TabCard
                  key={item.id}
                  item={item}
                  onOpen={(it) => openPanelWithQuery(`${it.title} ${it.artist}`)}
                />
              ))}
              {!tabItems.length && (
                <div className="opacity-60 col-span-full">Nenhuma tablatura encontrada.</div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Drawer do Songsterr (abre pelo botão ou por um TabCard) */}
      <SongsterrPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        fallbackQuery={panelSeedQuery}
      />
    </>
  );
}
