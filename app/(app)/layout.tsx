"use client";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import PlayerBar from "@/components/PlayerBar";
import MobileTopNav from "@/components/nav/MobileTopNav";
import "../globals.css";

const YouTubePlayer = dynamic(() => import("@/components/YouTubePlayer"), { ssr: false });

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid md:grid-cols-[256px_1fr] min-h-screen">
      {/* Sidebar permanece no desktop */}
      <Sidebar />

      {/* Conteúdo */}
      <div className="relative">
        {/* Top nav só no mobile, fixa no topo */}
        <MobileTopNav />
        {/* padding-top apenas no mobile para não cobrir o conteúdo */}
        <main className="pt-[64px] md:pt-0 flex flex-col pb-28">
          {children}
        </main>
      </div>

      {/* Players (como antes) */}
      <YouTubePlayer />
      <PlayerBar />
    </div>
  );
}
