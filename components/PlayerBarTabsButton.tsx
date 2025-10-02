"use client";
import { BookOpen } from "lucide-react";
import { useState } from "react";
import SongsterrPanel from "./SongsterrPanel";
import { usePlayer } from "@/hooks/usePlayer";

export default function PlayerBarTabsButton() {
  const [open, setOpen] = useState(false);
  const { queue, index } = usePlayer();
  const current = queue[index];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded hover:bg-white/5"
        title="Abrir tablatura (Songsterr)"
        aria-label="Abrir tablatura"
        disabled={!current}
      >
        <BookOpen size={18} />
      </button>

      <SongsterrPanel
        open={open}
        onClose={() => setOpen(false)}
        fallbackQuery={current ? `${current.title} ${current.channel || ""}` : ""}
      />
    </>
  );
}
