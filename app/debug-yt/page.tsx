"use client";
import { useEffect, useRef, useState } from "react";

const DEMO = "M7lc1UVf-VE";

export default function DebugYT() {
  const [ready, setReady] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const log = (m: string) => setLogs((s) => [...s, m]);

  useEffect(() => {
    const n = document.getElementById("nocookie") as HTMLIFrameElement | null;
    const y = document.getElementById("youtube") as HTMLIFrameElement | null;
    if (n) {
      n.setAttribute(
        "src",
        `https://www.youtube-nocookie.com/embed/${DEMO}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`
      );
      n.setAttribute(
        "allow",
        "autoplay; encrypted-media; fullscreen; picture-in-picture"
      );
    }
    if (y) {
      y.setAttribute(
        "src",
        `https://www.youtube.com/embed/${DEMO}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`
      );
      y.setAttribute(
        "allow",
        "autoplay; encrypted-media; fullscreen; picture-in-picture"
      );
    }
    setReady(true);
  }, []);

  const startWithGesture = () => {
    const g = document.getElementById("gesture") as HTMLIFrameElement | null;
    if (!g) return;
    g.setAttribute(
      "src",
      `https://www.youtube.com/embed/${DEMO}?autoplay=1&mute=0&playsinline=1&rel=0&modestbranding=1`
    );
    g.setAttribute(
      "allow",
      "autoplay; encrypted-media; fullscreen; picture-in-picture"
    );
    log("Gesture: carregado com autoplay=1 mute=0 no youtube.com");
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Debug YouTube</h1>
      <p>Pronto: {String(ready)}</p>

      <h2 style={{ marginTop: 16 }}>1) nocookie (autoplay mudo)</h2>
      <iframe id="nocookie" width="480" height="270" title="nocookie" />

      <h2 style={{ marginTop: 16 }}>2) youtube.com (autoplay mudo)</h2>
      <iframe id="youtube" width="480" height="270" title="youtube.com" />

      <h2 style={{ marginTop: 16 }}>3) Start com gesto (desbloqueia Brave)</h2>
      <button
        onClick={startWithGesture}
        style={{
          padding: "8px 12px",
          background: "#10b981",
          borderRadius: 6,
          color: "#111",
          fontWeight: 600,
        }}
      >
        Start (gesture)
      </button>
      <div style={{ marginTop: 8 }}>
        <iframe id="gesture" width="480" height="270" title="gesture" />
      </div>

      <pre style={{ marginTop: 16, background: "#111", padding: 12 }}>
        {logs.join("\n")}
      </pre>
    </div>
  );
}
