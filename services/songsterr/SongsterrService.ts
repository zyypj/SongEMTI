export type SongsterrContribution = Record<string, unknown>;

export type TrackJsonResponse = {
  ok: boolean;
  json?: any;
};

export interface ISongsterrService {
  searchTabs(q: string): Promise<any[]>;
  listContributions(songId: number | string): Promise<SongsterrContribution[] | { needsAuth: true }>;
  fetchTrackJson(cdnPath: string): Promise<TrackJsonResponse>;
  findCdnPathInContribution(obj: SongsterrContribution): string | null;
}

export class SongsterrService implements ISongsterrService {
  constructor(
    private readonly apiBase: string = "/api/songsterr",
  ) {}

  async searchTabs(q: string): Promise<any[]> {
    const r = await fetch(`${this.apiBase}/search?q=${encodeURIComponent(q)}`, { cache: "no-store" });
    if (!r.ok) return [];
    const j = await r.json();
    return Array.isArray(j?.items) ? j.items : [];
  }

  async listContributions(songId: number | string): Promise<SongsterrContribution[] | { needsAuth: true }> {
    const r = await fetch(`${this.apiBase}/contributions?songId=${encodeURIComponent(String(songId))}`, { cache: "no-store" });
    if (!r.ok) return [];
    const j = await r.json();
    if (j?.needsAuth) return { needsAuth: true as const };
    return Array.isArray(j?.items) ? j.items : [];
  }

  async fetchTrackJson(cdnPath: string): Promise<TrackJsonResponse> {
    const r = await fetch(`${this.apiBase}/track-json?path=${encodeURIComponent(cdnPath)}`, { cache: "no-store" });
    if (!r.ok) return { ok: false };
    const j = await r.json();
    return j as TrackJsonResponse;
  }

  findCdnPathInContribution(obj: SongsterrContribution): string | null {
    const VALID_PATH = /^\/\d+\/\d+\/[A-Za-z0-9\-_]+\/0\.json$/;

    const visit = (v: unknown): string | null => {
      if (v == null) return null;
      if (typeof v === "string") {
        if (VALID_PATH.test(v)) return v;
        try {
          const url = new URL(v);
          if (VALID_PATH.test(url.pathname)) return url.pathname;
        } catch { /* ignore */ }
        return null;
      }
      if (Array.isArray(v)) {
        for (const it of v) {
          const found = visit(it);
          if (found) return found;
        }
        return null;
      }
      if (typeof v === "object") {
        for (const key of Object.keys(v as any)) {
          const found = visit((v as any)[key]);
          if (found) return found;
        }
      }
      return null;
    };

    return visit(obj);
  }
}
