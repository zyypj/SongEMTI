"use client";
import { useEffect, useState } from "react";
import Topbar from "@/components/Topbar";
import Link from "next/link";
import { usePlayer } from "@/hooks/usePlayer";
import { Play } from "lucide-react";
import PlaylistCover from "@/components/PlaylistCover";
import PlaylistKebab from "@/components/PlaylistKebab";

type Track = { videoId: string; title: string; channel: string; thumb: string; durationSec?: number };
type PlaylistCard = { id: string; name: string; createdAt: string; count: number; covers: string[] };

function fmtDate(d: string) {
  try { return new Date(d).toLocaleDateString(); } catch { return ""; }
}

export default function LibraryPage() {
  const [favs, setFavs] = useState<Track[]>([]);
  const [lists, setLists] = useState<PlaylistCard[]>([]);
  const { setQueue, play } = usePlayer();

  const load = async () => {
    const [f, p] = await Promise.all([
      fetch("/api/favorites").then(r => r.json()).catch(() => []),
      fetch("/api/playlists/summary").then(r => r.json()).catch(() => []),
    ]);
    setFavs(f);
    setLists(p);
  };

  useEffect(() => { load(); }, []);

  const playAll = (tracks: Track[]) => {
    if (!tracks.length) return;
    setQueue(
      tracks.map(t => ({ videoId: t.videoId, title: t.title, channel: t.channel, thumb: t.thumb })),
      0
    );
    play(0);
  };

  return (
    <>
      <Topbar onSearch={() => { }} />
      <div className="p-6 space-y-10">
        {/* Favoritas */}
        <section>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold">Suas favoritas</h2>
              <p className="opacity-60 text-sm">Músicas que você marcou com ⭐</p>
            </div>
            <button
              className="text-sm px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20"
              onClick={() => playAll(favs)}
            >
              Tocar tudo
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favs.map((t) => (
              <button
                key={t.videoId}
                className="group rounded-xl overflow-hidden bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-left transition"
                onClick={() => playAll([t])}
                title="Tocar esta música"
              >
                <div className="relative">
                  <img src={t.thumb} className="w-full aspect-video object-cover" alt="" />
                  <div className="absolute right-2 bottom-2 p-2 rounded-full bg-emerald-600/90 group-hover:bg-emerald-500 transition">
                    <Play size={16} />
                  </div>
                </div>
                <div className="p-3">
                  <div className="font-medium truncate">{t.title}</div>
                  <div className="text-sm opacity-60 truncate">{t.channel}</div>
                </div>
              </button>
            ))}

            {!favs.length && (
              <div className="col-span-full py-10 text-center opacity-60">
                Você ainda não tem favoritas. Use a estrela ⭐ nos 3 pontinhos da PlayerBar.
              </div>
            )}
          </div>
        </section>

        {/* Playlists */}
        <section>
          <h2 className="text-2xl font-bold">Suas playlists</h2>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {lists.map((pl) => (
              <div
                key={pl.id}
                className="group rounded-xl overflow-hidden bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition"
              >
                {/* Header da capa com ⋯ fora do Link para não navegar ao clicar */}
                <div className="relative">
                  <Link href={`/library/playlist/${pl.id}`} className="block">
                    <PlaylistCover thumbs={pl.covers} className="w-full" />
                  </Link>

                  <div className="absolute right-1 top-1">
                    <PlaylistKebab
                      playlistId={pl.id}
                      playlistName={pl.name}
                      onDeleted={load}
                    />
                  </div>

                  <Link href={`/library/playlist/${pl.id}`}>
                    <div className="absolute right-2 bottom-2 p-2 rounded-full bg-emerald-600/90 group-hover:bg-emerald-500 transition">
                      <Play size={16} />
                    </div>
                  </Link>
                </div>

                <Link href={`/library/playlist/${pl.id}`} className="block p-3">
                  <div className="font-semibold truncate">{pl.name}</div>
                  <div className="text-xs opacity-60 mt-0.5">
                    {pl.count} músicas • criada em {fmtDate(pl.createdAt)}
                  </div>
                </Link>
              </div>
            ))}

            {!lists.length && (
              <div className="col-span-full py-10 text-center opacity-60">
                Você ainda não tem playlists. Use “Adicionar à playlist” nos 3 pontinhos da PlayerBar.
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
