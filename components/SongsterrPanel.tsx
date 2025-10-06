"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { X, Guitar, Drum, Music2, ExternalLink, Loader2, Download } from "lucide-react";
import { usePlayer } from "@/hooks/usePlayer";
import { SongsterrService, type SongsterrContribution } from "@/services/songsterr/SongsterrService";

type SongsterrItem = {
  id: number;
  title: string;
  artist: string;
  page: string;
  thumb?: string;
  tracks?: any[];
};

type ContributionItem = {
  id?: number;
  trackId?: number;
  name?: string;         // ex.: "Guitar 1"
  instrument?: string;   // ex.: "Guitar", "Bass"
  difficulty?: string;   // se vier
} & SongsterrContribution;

const service = new SongsterrService();

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

  // extras
  const [parts, setParts] = useState<ContributionItem[]>([]);
  const [needAuth, setNeedAuth] = useState(false);

  // embed fallback
  const [canEmbed, setCanEmbed] = useState(true);
  const loadGuard = useRef<number | null>(null);

  // modo acadêmico: seleção de instrumento -> JSON
  const [selectedPartIdx, setSelectedPartIdx] = useState<number | null>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [trackJson, setTrackJson] = useState<any | null>(null);
  const [trackPath, setTrackPath] = useState<string | null>(null);

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

  // reset “modo acadêmico” ao trocar active
  useEffect(() => {
    setSelectedPartIdx(null);
    setTrackLoading(false);
    setTrackError(null);
    setTrackJson(null);
    setTrackPath(null);
  }, [active?.id]);

  // Busca arranjos/contribuições (instrumentos) do item ativo
  useEffect(() => {
    (async () => {
      setParts([]);
      setNeedAuth(false);
      if (!active?.id) return;
      try {
        const res = await service.listContributions(active.id);
        if ((res as any)?.needsAuth) { setNeedAuth(true); return; }
        setParts(Array.isArray(res) ? (res as ContributionItem[]) : []);
      } catch {
        // silencioso
      }
    })();
  }, [active?.id]);

  // controla fallback de iframe bloqueado (X-Frame-Options/CSP)
  useEffect(() => {
    setCanEmbed(true);
    if (loadGuard.current) window.clearTimeout(loadGuard.current);
    if (!active?.page) return;
    loadGuard.current = window.setTimeout(() => setCanEmbed(false), 1200);
    return () => {
      if (loadGuard.current) window.clearTimeout(loadGuard.current);
    };
  }, [active?.page]);

  const handleIframeLoad = () => {
    setCanEmbed(true);
    if (loadGuard.current) window.clearTimeout(loadGuard.current);
  };

  // === ACADEMIC MODE: carregar JSON do instrumento selecionado ===
  const onSelectPart = async (idx: number) => {
    setSelectedPartIdx(idx);
    setTrackLoading(true);
    setTrackError(null);
    setTrackJson(null);
    setTrackPath(null);

    try {
      const part = parts[idx];
      // tenta achar caminho CDN dentro do objeto
      const path = service.findCdnPathInContribution(part);
      if (!path) {
        setTrackError("Não encontrei o caminho do JSON deste instrumento no objeto retornado.");
        setTrackLoading(false);
        return;
      }
      setTrackPath(path);

      const res = await service.fetchTrackJson(path);
      if (!res.ok || !res.json) {
        setTrackError("Falha ao carregar o JSON do instrumento.");
        setTrackLoading(false);
        return;
      }
      setTrackJson(res.json);
    } catch (e) {
      setTrackError("Erro inesperado ao carregar o JSON.");
    } finally {
      setTrackLoading(false);
    }
  };

  // helper para salvar o JSON em arquivo
  const downloadTrackJson = () => {
    if (!trackJson) return;
    const blob = new Blob([JSON.stringify(trackJson, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const base = `${active?.artist ?? "artist"}-${active?.title ?? "song"}`.replace(/\s+/g, "_").toLowerCase();
    a.href = url;
    a.download = `${base}-instrument.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // metadados básicos do JSON (se existirem)
  const deriveMeta = (j: any) => {
    try {
      const tracks = Array.isArray(j?.tracks) ? j.tracks.length : undefined;
      const measures = Array.isArray(j?.measures) ? j.measures.length : undefined;
      const tempo =
        j?.score?.tempo ||
        j?.meta?.tempo ||
        j?.song?.tempo ||
        undefined;
      return { tracks, measures, tempo };
    } catch {
      return {};
    }
  };

  const meta = trackJson ? deriveMeta(trackJson) : {};

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
          <div className="flex items-center gap-2">
            {active?.page && (
              <a
                href={active.page}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20"
                title="Abrir no Songsterr"
              >
                Abrir no Songsterr <ExternalLink size={14} />
              </a>
            )}
            <button onClick={onClose} className="p-2 rounded hover:bg-white/10" aria-label="Fechar">
              <X size={16} />
            </button>
          </div>
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

        {/* chips de instrumentos/arranjos */}
        {!!parts.length && (
          <div className="px-4 py-2 flex gap-2 flex-wrap border-b border-white/10">
            {parts.map((p, i) => {
              const label = `${p.instrument || "Instrument"}${p.name ? ` • ${p.name}` : ""}`;
              const selected = i === selectedPartIdx;
              return (
                <button
                  key={(p.id as number) ?? (p.trackId as number) ?? i}
                  onClick={() => onSelectPart(i)}
                  className={`px-2 py-1 rounded-full border text-xs transition ${
                    selected ? "bg-emerald-600 border-emerald-600" : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                  title={label}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {needAuth && (
          <div className="px-4 py-2 border-b border-white/10">
            <div className="text-xs opacity-80">
              Para listar instrumentos/arranjos desta música, faça login no Songsterr e abra a página oficial.
            </div>
          </div>
        )}

        {/* bloco acadêmico: preview do JSON selecionado */}
        {selectedPartIdx !== null && (
          <div className="px-4 py-3 border-b border-white/10">
            {trackLoading && (
              <div className="flex items-center gap-2 text-sm opacity-80">
                <Loader2 className="animate-spin" size={14} /> Carregando JSON do instrumento…
              </div>
            )}
            {!trackLoading && trackError && (
              <div className="text-sm text-red-400">{trackError}</div>
            )}
            {!trackLoading && !trackError && trackJson && (
              <div className="space-y-2 text-sm">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="opacity-70">Caminho:</span>
                  <code className="px-2 py-1 rounded bg-white/5 border border-white/10 break-all">{trackPath}</code>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  {meta.tempo != null && <div><span className="opacity-70">Tempo:</span> {meta.tempo}</div>}
                  {meta.tracks != null && <div><span className="opacity-70">Tracks:</span> {meta.tracks}</div>}
                  {meta.measures != null && <div><span className="opacity-70">Measures:</span> {meta.measures}</div>}
                </div>
                <div className="mt-2">
                  <button
                    onClick={downloadTrackJson}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20"
                    title="Baixar JSON"
                  >
                    <Download size={14} /> Baixar JSON
                  </button>
                </div>
                <div className="mt-3 max-h-52 overflow-auto rounded border border-white/10 bg-black/20 p-3 text-xs leading-relaxed">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(trackJson, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-4">
          {active ? (
            <div className="aspect-video w-full rounded-lg overflow-hidden border border-white/10">
              {canEmbed ? (
                <iframe
                  key={active.page}
                  src={active.page}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-top-navigation-by-user-activation"
                  referrerPolicy="no-referrer-when-downgrade"
                  onLoad={handleIframeLoad}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-center p-6">
                  <div className="max-w-md opacity-80">
                    <p>Não foi possível exibir o Songsterr embutido (bloqueado por configurações do site).</p>
                    {active.page && (
                      <a
                        href={active.page}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500"
                      >
                        Abrir no Songsterr <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-10 text-center opacity-60">Selecione uma tablatura acima.</div>
          )}
        </div>
      </div>
    </div>
  );
}
