"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Shuffle, Repeat, ListMusic, Volume2 } from "lucide-react";

type Props = {
  onToggleShuffle?: () => void;
  onToggleRepeat?: () => void;
  onOpenQueue?: () => void;
  onOpenVolume?: () => void;
};

export default function MobileOverflowMenu({
  onToggleShuffle,
  onToggleRepeat,
  onOpenQueue,
  onOpenVolume,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const item = (onClick: any, Icon: any, label: string) => (
    <button
      onClick={() => { onClick?.(); setOpen(false); }}
      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
      aria-label={label}
    >
      <Icon size={16} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="relative" ref={ref}>
      <button
        className="p-2 rounded-md hover:bg-zinc-800 text-zinc-200"
        aria-label="More"
        onClick={() => setOpen(v => !v)}
      >
        <MoreHorizontal size={20} aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute bottom-10 right-0 min-w-[180px] rounded-md border border-zinc-800 bg-zinc-900 shadow-xl">
          {item(onToggleShuffle, Shuffle, "Shuffle")}
          {item(onToggleRepeat, Repeat, "Repeat")}
          {item(onOpenQueue, ListMusic, "Queue")}
          {item(onOpenVolume, Volume2, "Volume")}
        </div>
      )}
    </div>
  );
}
