import { create } from "zustand";
type PlayerState = {
  queue: { videoId: string; title: string; channel: string; thumb: string }[];
  index: number;
  playing: boolean;
  setQueue: (q: PlayerState["queue"], startIndex?: number) => void;
  play: (i?: number) => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
};
export const usePlayer = create<PlayerState>((set, get) => ({
  queue: [], index: 0, playing: false,
  setQueue: (q, startIndex = 0) => set({ queue: q, index: startIndex, playing: true }),
  play: (i) => set({ index: i ?? get().index, playing: true }),
  pause: () => set({ playing: false }),
  next: () => set(s => ({ index: Math.min(s.index + 1, s.queue.length - 1), playing: true })),
  prev: () => set(s => ({ index: Math.max(s.index - 1, 0), playing: true })),
}));
