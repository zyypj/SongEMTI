"use client";
import { usePlayer } from "@/hooks/usePlayer";

type Track = { videoId: string; title: string; channel: string; thumb: string };

export default function TrackCard({ t, index, all }:{ t:Track; index:number; all:Track[] }) {
  const { setQueue, play } = usePlayer();

  return (
    <button
      className="group rounded-lg overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 text-left"
      onClick={() => {
        const list = all.filter(x => !!x.videoId);
        if (!list.length) return;
        setQueue(list, index);
        play(index);
        window.dispatchEvent(new Event("pointerdown"));
      }}
    >
      <img src={t.thumb} alt="" className="w-full aspect-video object-cover" />
      <div className="p-3">
        <div className="font-medium truncate">{t.title}</div>
        <div className="text-sm opacity-60 truncate">{t.channel}</div>
      </div>
    </button>
  );
}
