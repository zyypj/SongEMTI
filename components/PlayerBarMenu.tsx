"use client";
import { useEffect, useRef, useState } from "react";
import { Plus, ChevronRight, X } from "lucide-react";

type Track = { videoId: string; title: string; channel: string; thumb: string };

export default function PlaylistMenu({ track }: { track?: Track }) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<"root" | "choose">("root");
  const [lists, setLists] = useState<{ id: string; name: string }[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) {
        setOpen(false);
        setStage("root");
        setCreating(false);
        setNewName("");
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (open && stage === "choose") {
      fetch("/api/playlists").then(r => r.json()).then(setLists).catch(() => setLists([]));
    }
  }, [open, stage]);

  const addToPlaylist = async (playlistId: string) => {
    if (!track) return;
    await fetch("/api/playlists/add", {
      method: "POST",
      body: JSON.stringify({ playlistId, track }),
    });
    setOpen(false);
    setStage("root");
  };

  const createAndAdd = async () => {
    if (!newName.trim() || !track) return;
    const r = await fetch("/api/playlists", { method: "POST", body: JSON.stringify({ name: newName.trim() }) });
    const pl = await r.json();
    await addToPlaylist(pl.id);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="p-2 rounded hover:bg-white/10 transition"
        aria-label="Mais opções"
      >
        ⋯
      </button>

      {open && (
        <div
          ref={boxRef}
          className="absolute right-0 bottom-10 w-80 rounded-lg border border-white/10 bg-neutral-900/90 backdrop-blur shadow-2xl animate-in fade-in zoom-in-95"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
            <div className="text-sm font-medium opacity-80">
              {stage === "root" ? "Opções" : "Adicionar à playlist"}
            </div>
            <button
              onClick={() => { setOpen(false); setStage("root"); setCreating(false); setNewName(""); }}
              className="p-1 rounded hover:bg-white/10"
            >
              <X size={16} />
            </button>
          </div>

          {/* Root: uma única linha “Adicionar à playlist” */}
          {stage === "root" && (
            <button
              onClick={() => setStage("choose")}
              className="w-full flex items-center justify-between px-3 py-3 hover:bg-white/5"
            >
              <span className="text-sm">Adicionar à playlist</span>
              <ChevronRight size={16} className="opacity-70" />
            </button>
          )}

          {/* Choose: lista de playlists + criar nova */}
          {stage === "choose" && (
            <div className="p-2 space-y-2">
              {lists.length > 0 ? (
                <div className="max-h-56 overflow-auto rounded border border-white/10">
                  {lists.map(pl => (
                    <button
                      key={pl.id}
                      onClick={() => addToPlaylist(pl.id)}
                      className="w-full text-left px-3 py-2 hover:bg-white/5"
                    >
                      {pl.name}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-2 py-3 text-sm opacity-60">Você ainda não tem playlists.</div>
              )}

              {!creating ? (
                <button
                  onClick={() => setCreating(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500"
                >
                  <Plus size={16} /> Criar nova playlist
                </button>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Nome da playlist"
                    className="flex-1 rounded bg-neutral-800 px-3 py-2 border border-white/10"
                  />
                  <button
                    onClick={createAndAdd}
                    className="px-3 rounded bg-emerald-600 hover:bg-emerald-500"
                  >
                    Criar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
