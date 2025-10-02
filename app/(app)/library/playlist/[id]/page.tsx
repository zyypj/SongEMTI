"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Play, Shuffle, Pencil, Check, X } from "lucide-react";
import { usePlayer } from "@/hooks/usePlayer";
import PlaylistCover from "@/components/PlaylistCover";
import PlaylistKebab from "@/components/PlaylistKebab";
import TrackKebab from "@/components/TrackKebab";

type Track = { videoId: string; title: string; channel: string; thumb: string; durationSec?: number };
type PlaylistMeta = { id: string; name: string; createdAt: string };

function fmtDate(d: string) {
  try { return new Date(d).toLocaleDateString(); } catch { return ""; }
}
function fmtDur(totalSec: number | null) {
  if (!totalSec || totalSec <= 0) return "—";
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`;
}

export default function PlaylistPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { setQueue, play } = usePlayer();

  const [meta, setMeta] = useState<PlaylistMeta | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [renameMode, setRenameMode] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const coverThumbs = useMemo(() => tracks.slice(0, 4).map(t => t.thumb).filter(Boolean), [tracks]);

  const reload = async () => {
    const [m, t] = await Promise.all([
      fetch(`/api/playlists/${id}/meta`).then(r => r.json()).catch(() => null),
      fetch(`/api/playlists/${id}`).then(r => r.json()).catch(() => []),
    ]);
    setMeta(m);
    setNameDraft(m?.name ?? "");
    setTracks(t);
  };

  useEffect(() => { reload(); }, [id]);

  useEffect(() => {
    const missing = tracks.filter(t => !t.durationSec || t.durationSec <= 0).map(t => t.videoId);
    if (!missing.length) return;
    (async () => {
      try {
        const map: Record<string, number> = await fetch(
          `/api/ytduration?ids=${encodeURIComponent(missing.join(","))}`
        ).then(r => r.json());

        setTracks(prev => prev.map(t => map[t.videoId] ? { ...t, durationSec: map[t.videoId] } : t));

        await Promise.all(
          Object.entries(map).map(([videoId, durationSec]) =>
            fetch("/api/tracks/update-duration", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ videoId, durationSec }),
            }).catch(() => null)
          )
        );
      } catch {}
    })();
  }, [tracks]);

  const totalSec = useMemo(
    () => tracks.reduce((acc, t) => acc + (t.durationSec || 0), 0),
    [tracks]
  );

  const playAll = () => { if (tracks.length) { setQueue(tracks, 0); play(0); } };
  const playFrom = (idx: number) => { if (tracks.length) { setQueue(tracks, idx); play(idx); } };
  const shuffle = () => {
    if (!tracks.length) return;
    const arr = [...tracks];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setQueue(arr, 0);
    play(0);
  };

  const startRename = () => { setRenameMode(true); setNameDraft(meta?.name ?? ""); };
  const cancelRename = () => { setRenameMode(false); setNameDraft(meta?.name ?? ""); };
  const saveRename = async () => {
    if (!meta) return;
    const name = nameDraft.trim();
    if (!name || name === meta.name) { setRenameMode(false); return; }
    setBusy(true);
    try {
      const r = await fetch(`/api/playlists/${meta.id}/rename`, { method: "PATCH", body: JSON.stringify({ name }) });
      if (r.ok) { setMeta({ ...meta, name }); setRenameMode(false); }
    } finally { setBusy(false); }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/library" className="p-2 rounded hover:bg-white/10" aria-label="Voltar">
          <ArrowLeft size={18} />
        </Link>

        <PlaylistCover thumbs={coverThumbs} className="w-44" />

        <div className="min-w-0 relative z-10">
          <div className="text-xs uppercase opacity-70">Playlist</div>

          {!renameMode ? (
            <div className="mt-1 flex items-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight truncate">{meta?.name ?? "—"}</h1>
              <button onClick={startRename} className="p-1.5 rounded hover:bg-white/10" title="Renomear">
                <Pencil size={16} />
              </button>
              <PlaylistKebab
                playlistId={meta?.id || ""}
                playlistName={meta?.name}
                onDeleted={() => router.push("/library")}
              />
            </div>
          ) : (
            <div className="mt-2 flex items-center gap-2">
              <input
                value={nameDraft}
                onChange={e => setNameDraft(e.target.value)}
                className="px-3 py-2 rounded bg-neutral-900 border border-white/10 min-w-[240px]"
                placeholder="Nome da playlist"
                autoFocus
              />
              <button onClick={saveRename} disabled={busy} className="p-1.5 rounded bg-emerald-600 hover:bg-emerald-500">
                <Check size={16} />
              </button>
              <button onClick={cancelRename} className="p-1.5 rounded hover:bg-white/10">
                <X size={16} />
              </button>
            </div>
          )}

          <div className="mt-2 text-sm opacity-70">
            {tracks.length} músicas • Duração total {fmtDur(totalSec)} • Criada em {meta ? fmtDate(meta.createdAt) : "—"}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={playAll}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500"
            >
              <Play size={18} /> Tocar
            </button>
            <button
              onClick={shuffle}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20"
            >
              <Shuffle size={18} /> Shuffle
            </button>
          </div>
        </div>
      </div>

      <div className="mt-2 rounded-lg border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03]">
            <tr className="[&>th]:py-2 [&>th]:px-3 text-left">
              <th>#</th>
              <th>Música</th>
              <th className="w-28 text-right pr-4">Duração</th>
              <th className="w-32">Ações</th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((t, i) => (
              <tr key={t.videoId} className="border-t border-white/10 hover:bg-white/[0.03]">
                <td className="py-2 px-3 opacity-60">{i + 1}</td>

                <td className="py-2 px-3">
                  <div className="flex items-center gap-3">
                    <img src={t.thumb} alt="" className="w-12 h-12 rounded object-cover" />
                    <div className="min-w-0">
                      <div className="truncate font-medium">{t.title}</div>
                      <div className="truncate opacity-60">{t.channel}</div>
                    </div>
                  </div>
                </td>

                <td className="py-2 px-3 text-right pr-4 opacity-80">
                  {fmtDur((t.durationSec ?? 0) || 0)}
                </td>

                <td className="py-2 px-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => playFrom(i)}
                      className="p-2 rounded hover:bg-white/10"
                      title="Tocar a partir desta"
                    >
                      <Play size={16} />
                    </button>
                    <button
                      onClick={() => {
                        const others = tracks.filter((_, idx) => idx !== i);
                        for (let k = others.length - 1; k > 0; k--) {
                          const j = Math.floor(Math.random() * (k + 1));
                          [others[k], others[j]] = [others[j], others[k]];
                        }
                        const arr = [tracks[i], ...others];
                        setQueue(arr, 0);
                        play(0);
                      }}
                      className="p-2 rounded hover:bg-white/10"
                      title="Shuffle a partir desta"
                    >
                      <Shuffle size={16} />
                    </button>
                    <TrackKebab
                      playlistId={meta?.id || ""}
                      videoId={t.videoId}
                      title={t.title}
                      onRemoved={() => setTracks(prev => prev.filter(x => x.videoId !== t.videoId))}
                      className="ml-1"
                    />
                  </div>
                </td>
              </tr>
            ))}

            {!tracks.length && (
              <tr>
                <td colSpan={4} className="py-8 text-center opacity-60">
                  Sua playlist está vazia. Adicione músicas pelo “⋯” da PlayerBar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
