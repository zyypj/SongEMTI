"use client";
import { useEffect, useRef, useState } from "react";
import { MoreVertical, Trash2, X } from "lucide-react";
import Portal from "@/components/Portal";

export default function PlaylistKebab({
  playlistId,
  playlistName,
  onDeleted,
  className = "",
}: {
  playlistId: string;
  playlistName?: string;
  onDeleted?: () => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [pos, setPos] = useState<{top:number; left:number}>({ top: 0, left: 0 });

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const el = e.target as Node;
      if (!btnRef.current) return;
      const menu = document.getElementById(`pl-kebab-${playlistId}`);
      if (menu && (menu.contains(el) || btnRef.current.contains(el))) return;
      setOpen(false); setConfirming(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); setConfirming(false); } };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open, playlistId]);

  const positionMenu = () => {
    const b = btnRef.current?.getBoundingClientRect();
    if (!b) return;
    setPos({ top: Math.round(b.bottom + window.scrollY + 8), left: Math.round(b.right + window.scrollX - 256) }); // 256px ~ w-64
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

  const doDelete = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/playlists/${playlistId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      onDeleted?.();
    } finally {
      setBusy(false);
      setConfirming(false);
      setOpen(false);
    }
  };

  return (
    <div className={className}>
      <button
        ref={btnRef}
        onClick={() => setOpen(v => !v)}
        className="p-2 rounded hover:bg-white/10"
        aria-label="Mais opções"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <Portal>
          <div
            id={`pl-kebab-${playlistId}`}
            style={{ position: "absolute", top: pos.top, left: pos.left, width: 256 }}
            className="z-[10000] rounded-lg border border-white/10 bg-neutral-900/95 backdrop-blur shadow-2xl"
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
              <div className="text-sm font-medium opacity-80">Opções da playlist</div>
              <button onClick={() => { setOpen(false); setConfirming(false); }} className="p-1 rounded hover:bg-white/10">
                <X size={14} />
              </button>
            </div>

            {!confirming ? (
              <button
                onClick={() => setConfirming(true)}
                className="w-full flex items-center gap-2 px-3 py-3 hover:bg-white/5 text-left text-sm text-rose-300"
              >
                <Trash2 size={16} /> Excluir playlist
              </button>
            ) : (
              <div className="p-3 space-y-2">
                <div className="text-sm">
                  Tem certeza que deseja excluir <span className="font-medium">{playlistName ?? "esta playlist"}</span>?
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={doDelete}
                    disabled={busy}
                    className="px-3 py-2 rounded bg-rose-600 hover:bg-rose-500 disabled:opacity-60"
                  >
                    Excluir
                  </button>
                  <button
                    onClick={() => setConfirming(false)}
                    className="px-3 py-2 rounded hover:bg-white/10"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </Portal>
      )}
    </div>
  );
}
