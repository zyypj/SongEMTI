"use client";
import { useEffect, useState } from "react";
import { ThumbsUp, ThumbsDown, Star } from "lucide-react";

type Track = { videoId: string; title: string; channel: string; thumb: string };
type RatingValue = "LIKE" | "DISLIKE" | "NONE";

export default function ActionsBar({ track }: { track?: Track }) {
  const [fav, setFav] = useState<boolean>(false);
  const [rating, setRating] = useState<RatingValue>("NONE");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setFav(false);
    setRating("NONE");
  }, [track?.videoId]);

  const toggleFav = async () => {
    if (!track || busy) return;
    setBusy(true);
    try {
      const r = await fetch("/api/favorites", { method: "POST", body: JSON.stringify({ track }) });
      const txt = await r.text();
      setFav(txt === "favorited");
    } finally { setBusy(false); }
  };

  const setRate = async (v: RatingValue) => {
    if (!track || busy) return;
    setBusy(true);
    try {
      await fetch("/api/ratings", { method: "POST", body: JSON.stringify({ track, value: v }) });
      setRating(v);
    } finally { setBusy(false); }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={toggleFav}
        className={`p-2 rounded transition ${fav ? "text-emerald-400" : "hover:bg-white/10"}`}
        aria-label="Favoritar"
        disabled={busy || !track}
        title="Favoritar"
      >
        <Star size={18} fill={fav ? "currentColor" : "none"} />
      </button>

      <button
        onClick={() => setRate(rating === "LIKE" ? "NONE" : "LIKE")}
        className={`p-2 rounded transition ${rating === "LIKE" ? "text-emerald-400" : "hover:bg-white/10"}`}
        aria-label="Like"
        disabled={busy || !track}
        title="Like"
      >
        <ThumbsUp size={18} />
      </button>

      <button
        onClick={() => setRate(rating === "DISLIKE" ? "NONE" : "DISLIKE")}
        className={`p-2 rounded transition ${rating === "DISLIKE" ? "text-rose-400" : "hover:bg-white/10"}`}
        aria-label="Dislike"
        disabled={busy || !track}
        title="Dislike"
      >
        <ThumbsDown size={18} />
      </button>
    </div>
  );
}
