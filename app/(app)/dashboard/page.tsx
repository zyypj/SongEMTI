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

    try {
      const r = await fetch(`/api/youtube/search?q=${encodeURIComponent(qq)}`);
      const data = await r.json();
      setYtItems(normalizeYouTube(data.items));
    } catch {
      setYtItems([]);
    }

    try {
      const r2 = await fetch(`/api/songsterr/search?q=${encodeURIComponent(qq)}`);
      const j2 = await r2.json();
      setTabItems((j2?.items || []) as TabItem[]);
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
