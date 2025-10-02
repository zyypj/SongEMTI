"use client";
import { FC } from "react";
import { BookOpen } from "lucide-react";

type TabItem = {
  id: number;
  title: string;
  artist: string;
  page: string;
  thumb?: string;
};

const TabCard: FC<{ item: TabItem; onOpen: (item: TabItem)=>void }> = ({ item, onOpen }) => {
  return (
    <div className="group rounded-xl overflow-hidden bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition">
      <div className="relative">
        {/* placeholder visual estilo capa */}
        <div className="aspect-video w-full bg-gradient-to-br from-emerald-700/40 to-emerald-400/30 flex items-center justify-center">
          <span className="text-6xl opacity-30">𝄞</span>
        </div>
        <button
          onClick={() => onOpen(item)}
          className="absolute right-2 bottom-2 p-2 rounded-full bg-emerald-600/90 group-hover:bg-emerald-500 transition"
          title="Abrir tablatura"
          aria-label="Abrir tablatura"
        >
          <BookOpen size={16} />
        </button>
      </div>
      <div className="p-3">
        <div className="font-semibold truncate">{item.title}</div>
        <div className="text-xs opacity-60 mt-0.5 truncate">{item.artist}</div>
      </div>
    </div>
  );
};

export default TabCard;
