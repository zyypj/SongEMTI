"use client";
import { useEffect, useRef, useState } from "react";
import { usePlayer } from "@/hooks/usePlayer";

declare global {
  interface Window { YT: any; onYouTubeIframeAPIReady: any; __songemtiYT?: any }
}

const isValidId = (s: any) => typeof s === "string" && /^[\w-]{11}$/.test(s);

export default function YouTubePlayer() {
  const { queue, index, playing, next } = usePlayer();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const lastIdRef = useRef<string>("");
  const [userInteracted, setUserInteracted] = useState(false);
  const current = queue[index];

  useEffect(() => {
    const mark = () => setUserInteracted(true);
    window.addEventListener("pointerdown", mark, { once: true });
    window.addEventListener("keydown", mark, { once: true });
    return () => { window.removeEventListener("pointerdown", mark); window.removeEventListener("keydown", mark); };
  }, []);

  useEffect(() => {
    const ensureScript = () => {
      if (window.YT?.Player) return init();
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = () => init();
    };

    const init = () => {
      if (playerRef.current) return;
      if (!containerRef.current) return;
      if (window.__songemtiYT) { playerRef.current = window.__songemtiYT; return; }
      const el = document.createElement("div");
      el.id = "songemti-yt";
      containerRef.current.appendChild(el);
      playerRef.current = new window.YT.Player(el, {
        host: "https://www.youtube.com",
        height: "200",
        width: "356",
        playerVars: {
          enablejsapi: 1,
          autoplay: 1,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          origin: typeof window !== "undefined" ? window.location.origin : undefined
        },
        events: {
          onReady: (e: any) => {
            try { e.target.getIframe().setAttribute("allow","autoplay; encrypted-media; fullscreen; picture-in-picture"); } catch {}
            try { e.target.mute(); } catch {}
            const vid = current?.videoId;
            if (isValidId(vid)) {
              e.target.cueVideoById(vid);
              setTimeout(() => { try { e.target.playVideo(); } catch {} }, 0);
              lastIdRef.current = vid!;
            }
          },
          onStateChange: (e: any) => {
            const S = window.YT?.PlayerState;
            if (!S) return;
            if (e.data === S.ENDED) next();
            if (playing && (e.data === S.CUED || e.data === S.BUFFERING || e.data === S.UNSTARTED)) {
              try { e.target.playVideo(); } catch {}
            }
            if (userInteracted && (e.data === S.PLAYING || e.data === S.BUFFERING)) {
              try { e.target.unMute(); } catch {}
              try { e.target.setVolume(100); } catch {}
            }
          },
          onError: () => next()
        }
      });
      window.__songemtiYT = playerRef.current;
    };

    ensureScript();
  }, [current?.videoId]);
  useEffect(() => {
    const p = playerRef.current;
    const vid = current?.videoId;
    if (!p || !isValidId(vid)) return;
    if (lastIdRef.current !== vid) {
      try { p.loadVideoById(vid); } catch {}
      lastIdRef.current = vid!;
    }
    if (playing) {
      try { p.playVideo(); } catch {}
      if (userInteracted) { try { p.unMute(); } catch {}; try { p.setVolume(100); } catch {} }
    } else {
      try { p.pauseVideo(); } catch {}
    }
  }, [current?.videoId, playing, userInteracted]);

  return (
    <div
      ref={containerRef}
      style={{ position: "fixed", bottom: 0, right: 0, transform: "scale(0.001)", transformOrigin: "bottom right", opacity: 0.001, pointerEvents: "none", zIndex: -1 }}
    />
  );
}
