"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePlayer } from "@/hooks/usePlayer";
import {
  Play, Pause, SkipBack, SkipForward,
  Rewind, FastForward,
  Volume, Volume1, Volume2, VolumeX,
  MoreHorizontal
} from "lucide-react";
import PlaylistMenu from "./PlayerBarMenu";
import ActionsBar from "./ActionsBar";
import PlayerBarTabsButton from "./PlayerBarTabsButton";

type YTPlayer = {
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (s: number, allowSeekAhead?: boolean) => void;
  getVolume: () => number;
  setVolume: (v: number) => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
};

const VOL_KEY = "songemti:vol";
const DEFAULT_VOL = 25;

export default function PlayerBar() {
  const { queue, index, play, pause, next, prev, playing } = usePlayer();
  const current = queue[index];

  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);

  const [vol, setVol] = useState<number>(() => {
    if (typeof window === "undefined") return DEFAULT_VOL;
    const stored = parseInt(window.localStorage.getItem(VOL_KEY) || "", 10);
    return Number.isFinite(stored) ? Math.min(100, Math.max(0, stored)) : DEFAULT_VOL;
  });
  const desiredVolRef = useRef<number>(vol);

  const [muted, setMuted] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);
  const lastVol = useRef<number>(vol || DEFAULT_VOL);

  const player = useMemo<YTPlayer | null>(() => {
    if (typeof window === "undefined") return null;
    return (window as any).__songemtiYT ?? null;
  }, [typeof window !== "undefined" && (window as any).__songemtiYT]);

  useEffect(() => {
    const id = setInterval(() => {
      if (!player) return;
      const d = player.getDuration?.() || 0;
      const c = player.getCurrentTime?.() || 0;
      if (!scrubbing) setCur(c);
      setDur(d);
      setMuted(player.isMuted?.() || false);
    }, 250);
    return () => clearInterval(id);
  }, [player, scrubbing]);

  useEffect(() => {
    if (!player) return;
    if (!player.isMuted?.()) player.setVolume?.(desiredVolRef.current);
  }, [player, current?.videoId]);

  useEffect(() => {
    desiredVolRef.current = vol;
    if (typeof window !== "undefined") window.localStorage.setItem(VOL_KEY, String(vol));
    if (!player) return;
    if (!player.isMuted?.()) player.setVolume?.(vol);
  }, [vol, player]);

  const fmt = (s: number) => {
    if (!Number.isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60);
    return `${m}:${ss.toString().padStart(2, "0")}`;
  };

  const onSeekStart = () => setScrubbing(true);
  const onSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => setCur(parseFloat(e.target.value));
  const onSeekCommit = () => { player?.seekTo?.(cur, true); setScrubbing(false); };

  const seekBy = (delta: number) => {
    if (!player) return;
    const t = Math.max(0, Math.min((player.getCurrentTime?.() || 0) + delta, player.getDuration?.() || 0));
    player.seekTo?.(t, true);
  };

  const toggleMute = () => {
    if (!player) return;
    if (player.isMuted?.()) {
      player.unMute?.();
      player.setVolume?.(desiredVolRef.current || DEFAULT_VOL);
      setMuted(false);
    } else {
      lastVol.current = desiredVolRef.current || DEFAULT_VOL;
      player.mute?.();
      setMuted(true);
    }
  };

  const onVolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10);
    const clamped = Math.min(100, Math.max(0, v));
    setVol(clamped);
    if (!player) return;
    if (clamped === 0) {
      player.setVolume?.(0);
      player.mute?.();
      setMuted(true);
    } else {
      player.unMute?.();
      player.setVolume?.(clamped);
      lastVol.current = clamped;
      setMuted(false);
    }
  };

  const VolIcon = useMemo(() => {
    if (muted || vol === 0) return VolumeX;
    if (vol < 34) return Volume;
    if (vol < 67) return Volume1;
    return Volume2;
  }, [vol, muted]);

  if (!current) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 pointer-events-none">
      {/* DESKTOP */}
      <div className="hidden md:block pointer-events-auto border-t border-white/10 bg-neutral-950/80 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60">
        <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-3 items-center gap-4">
          {/* Esquerda */}
          <div className="flex items-center gap-3 min-w-0">
            <img src={current?.thumb || "/cover.png"} alt="" className="h-12 w-12 rounded object-cover" />
            <div className="min-w-0">
              <div className="truncate font-medium">{current?.title || "Nada tocando"}</div>
              <div className="truncate text-sm opacity-60">{current?.channel || "—"}</div>
            </div>
          </div>

          {/* Centro */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-white/5 rounded" onClick={() => seekBy(-10)} disabled={!dur}><Rewind size={18} /></button>
              <button className="p-2 hover:bg-white/5 rounded" onClick={prev} disabled={!queue.length}><SkipBack size={20} /></button>
              {playing ? (
                <button className="p-2 hover:bg-white/5 rounded" onClick={() => pause()} disabled={!queue.length}><Pause size={28} /></button>
              ) : (
                <button className="p-2 hover:bg-white/5 rounded" onClick={() => play()} disabled={!queue.length}><Play size={28} /></button>
              )}
              <button className="p-2 hover:bg-white/5 rounded" onClick={next} disabled={!queue.length}><SkipForward size={20} /></button>
              <button className="p-2 hover:bg-white/5 rounded" onClick={() => seekBy(+10)} disabled={!dur}><FastForward size={18} /></button>
            </div>

            <div className="w-full flex items-center gap-2">
              <span className="text-xs tabular-nums opacity-70 w-10 text-right">{fmt(cur)}</span>
              <input
                type="range"
                min={0}
                max={Math.max(1, Math.floor(dur))}
                value={Math.min(Math.floor(cur), Math.floor(dur || 1))}
                onMouseDown={onSeekStart}
                onTouchStart={onSeekStart}
                onChange={onSeekChange}
                onMouseUp={onSeekCommit}
                onTouchEnd={onSeekCommit}
                className="flex-1 h-1.5 appearance-none cursor-pointer bg-white/10 rounded-full accent-emerald-500"
              />
              <span className="text-xs tabular-nums opacity-70 w-10">{fmt(dur)}</span>
            </div>
          </div>

          {/* Direita */}
          <div className="flex items-center justify-end gap-2">
            <ActionsBar track={current} />
            <PlayerBarTabsButton />
            <PlaylistMenu track={current} />
            <button className="p-2 hover:bg-white/5 rounded" onClick={toggleMute} aria-label="Mute/Unmute">
              <VolIcon size={18} />
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={muted ? 0 : vol}
              onChange={onVolChange}
              className="w-28 h-1.5 appearance-none cursor-pointer bg-white/10 rounded-full accent-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* MOBILE (enxuto) */}
      <div
        className="block md:hidden pointer-events-auto border-t border-white/10 bg-neutral-950/95 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/80"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Mobile player bar"
      >
        <div className="mx-auto max-w-screen-sm px-3 py-2 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm text-zinc-100">{current?.title || "Nada tocando"}</div>
            <div className="truncate text-xs text-zinc-400">{current?.channel || "—"}</div>
          </div>

          <div className="flex items-center gap-1">
            {playing ? (
              <button className="p-2 rounded-md hover:bg-white/5 text-zinc-200" onClick={() => pause()} aria-label="Pause" disabled={!queue.length}>
                <Pause size={22} />
              </button>
            ) : (
              <button className="p-2 rounded-md hover:bg-white/5 text-zinc-200" onClick={() => play()} aria-label="Play" disabled={!queue.length}>
                <Play size={22} />
              </button>
            )}

            <button className="p-2 rounded-md hover:bg-white/5 text-zinc-200" onClick={next} aria-label="Next" disabled={!queue.length}>
              <SkipForward size={20} />
            </button>

            <MobileOverflowMenu
              onPrev={prev}
              onRewind={() => seekBy(-10)}
              onFastForward={() => seekBy(+10)}
              onToggleMute={toggleMute}
              volume={muted ? 0 : vol}
              onVolumeChange={onVolChange}
              trackNode={(
                <>
                  <ActionsBar track={current} />
                  <PlayerBarTabsButton />
                  <PlaylistMenu track={current} />
                </>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileOverflowMenu({
  onPrev,
  onRewind,
  onFastForward,
  onToggleMute,
  volume,
  onVolumeChange,
  trackNode
}: {
  onPrev?: () => void;
  onRewind?: () => void;
  onFastForward?: () => void;
  onToggleMute?: () => void;
  volume: number;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  trackNode?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        className="p-2 rounded-md hover:bg-white/5 text-zinc-200"
        aria-label="Mais opções"
        onClick={() => setOpen(v => !v)}
      >
        <MoreHorizontal size={20} />
      </button>

      {open && (
        <div className="absolute bottom-10 right-0 min-w-[220px] rounded-md border border-zinc-800 bg-zinc-900 shadow-xl">
          <div className="p-2">
            <button
              onClick={() => { onPrev?.(); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800 rounded"
            >
              Faixa anterior
            </button>

            <div className="grid grid-cols-2 gap-2 px-3 py-2">
              <button onClick={() => { onRewind?.(); setOpen(false); }} className="px-2 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800 rounded">
                -10s
              </button>
              <button onClick={() => { onFastForward?.(); setOpen(false); }} className="px-2 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800 rounded">
                +10s
              </button>
            </div>

            <div className="px-3 py-2 flex items-center gap-2">
              <button onClick={() => { onToggleMute?.(); }} className="p-2 rounded hover:bg-zinc-800" aria-label="Mute/Unmute">
                {volume === 0 ? <VolumeX size={16} /> : volume < 34 ? <Volume size={16} /> : volume < 67 ? <Volume1 size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={onVolumeChange}
                className="flex-1 h-1.5 appearance-none cursor-pointer bg-white/10 rounded-full accent-emerald-500"
              />
            </div>

            <div className="px-2 pt-1 pb-2 flex items-center gap-1 flex-wrap">
              {trackNode}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
