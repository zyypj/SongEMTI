"use client";
import { useState } from "react";
import UserMenu from "./UserMenu";

export default function Topbar({ onSearch }:{ onSearch:(q:string)=>void }) {
  const [q, setQ] = useState("");
  return (
    <div className="flex items-center gap-3 p-4 border-b border-white/10">
      <input
        value={q} onChange={e=>setQ(e.target.value)}
        placeholder="Buscar no YouTube..."
        className="flex-1 rounded bg-neutral-900 px-4 py-2 border border-white/10"
        onKeyDown={(e)=>{ if(e.key==="Enter") onSearch(q); }}
      />
      <button onClick={()=>onSearch(q)} className="rounded bg-emerald-500 px-4 py-2 hover:bg-emerald-400">Buscar</button>
      <UserMenu />
    </div>
  );
}
