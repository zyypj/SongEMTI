"use client";
import { useEffect, useMemo, useState } from "react";
import { X, Guitar, Drum, Music2 } from "lucide-react";
import { usePlayer } from "@/hooks/usePlayer";

type SongsterrItem = {
  id: number;
  title: string;
  artist: string;
  page: string;
  thumb?: string;
  tracks?: any[];
};

export default function SongsterrPanel({
  open,
  onClose,
  fallbackQuery
}: {
  open: boolean;
  onClose: () => void;
  fallbackQuery?: string;
}) {
  const { queue, index } = usePlayer();
  const current = queue[index];
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SongsterrItem[]>([]);
  const [active, setActive] = useState<SongsterrItem | null>(null);

  const query = useMemo(() => {
    if (current?.title) return `${current.title} ${current?.channel || ""}`.trim();
    return (fallbackQuery || "").trim();
  }, [current?.title, current?.channel, fallbackQuery]);

  useEffect(() => {
    if (!open) return;
    if (!query) { setItems([]); setActive(null); return; }
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/songsterr/search?q=${encodeURIComponent(query)}`);
        const j = await r.json();
        setItems(j.items || []);
        setActive((j.items || [])[0] || null);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, query]);

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-[60] transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      <div
        className={`absolute bottom-0 left-0 right-0 mx-auto max-w-5xl rounded-t-2xl border border-white/10 bg-neutral-950/95 shadow-2xl transition-transform ${open ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-70">Tabs</span>
            <div className="flex items-center gap-1 opacity-80">
              <Guitar size={16} /><Music2 size={16} /><Drum size={16} />
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-white/10" aria-label="Fechar">
            <X size={16} />
          </button>
        </div>

        <div className="px-4 py-3 flex gap-3 overflow-x-auto border-b border-white/10">
          {loading && <div className="text-sm opacity-70">Carregando...</div>}
          {!loading && !items.length && <div className="text-sm opacity-70">Nada encontrado no Songsterr.</div>}
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => setActive(it)}
              className={`px-3 py-1.5 rounded-full border text-sm transition whitespace-nowrap ${active?.id === it.id ? "bg-emerald-600 border-emerald-600" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
              title={`${it.artist} — ${it.title}`}
            >
              {it.title} — {it.artist}
            </button>
          ))}
        </div>

        <div className="p-4">
          {active ? (
            <div className="aspect-video w-full rounded-lg overflow-hidden border border-white/10">
              <iframe
                key={active.page}
                src={active.page}
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
              />
            </div>
          ) : (
            <div className="py-10 text-center opacity-60">Selecione uma tablatura acima.</div>
          )}
        </div>
      </div>
    </div>
  );
}
