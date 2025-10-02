"use client";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import PlayerBar from "@/components/PlayerBar";

const YouTubePlayer = dynamic(() => import("@/components/YouTubePlayer"), { ssr: false });

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid md:grid-cols-[256px_1fr] min-h-screen">
      <Sidebar />
      <main className="flex flex-col pb-28">{children}</main>
      <YouTubePlayer />
      <PlayerBar />
    </div>
  );
}
