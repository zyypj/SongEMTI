"use client";
import { useEffect, useRef, useState } from "react";
import { MoreVertical, Trash2, X } from "lucide-react";
import Portal from "@/components/Portal";

export default function TrackKebab({
  playlistId,
  videoId,
  title,
  onRemoved,
  className = "",
}: {
  playlistId: string;
  videoId: string;
  title?: string;
  onRemoved?: () => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      const menu = document.getElementById(`track-kebab-${playlistId}-${videoId}`);
      if (menu && (menu.contains(target) || btnRef.current?.contains(target))) return;
      setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open, playlistId, videoId]);

  const positionMenu = () => {
    const b = btnRef.current?.getBoundingClientRect();
    if (!b) return;
    setPos({ top: Math.round(b.bottom + window.scrollY + 8), left: Math.round(b.right + window.scrollX - 256) });
  };
  useEffect(() => {
    if (!open) return;
    positionMenu();
    const r = () => positionMenu();
    window.addEventListener("scroll", r, true);
    window.addEventListener("resize", r);
    return () => {
      window.removeEventListener("scroll", r, true);
      window.removeEventListener("resize", r);
    };
  }, [open]);

  const removeFromPlaylist = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/playlists/${playlistId}/items`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });
      if (!res.ok) throw new Error("delete failed");
      onRemoved?.();
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  return (
    <div className={className}>
      <button
        ref={btnRef}
        onClick={() => setOpen(v => !v)}
        className="p-2 rounded hover:bg-white/10"
        aria-label="Mais opções da faixa"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <Portal>
          <div
            id={`track-kebab-${playlistId}-${videoId}`}
            style={{ position: "absolute", top: pos.top, left: pos.left, width: 256 }}
            className="z-[10000] rounded-lg border border-white/10 bg-neutral-900/95 backdrop-blur shadow-2xl"
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
              <div className="text-sm font-medium opacity-80">Opções da música</div>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-white/10">
                <X size={14} />
              </button>
            </div>

            <button
              onClick={removeFromPlaylist}
              disabled={busy}
              className="w-full flex items-center gap-2 px-3 py-3 hover:bg-white/5 text-left text-sm text-rose-300 disabled:opacity-60"
            >
              <Trash2 size={16} /> Remover da playlist
            </button>
          </div>
        </Portal>
      )}
    </div>
  );
}
