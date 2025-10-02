"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Library, Home } from "lucide-react";
import clsx from "clsx";

export default function Sidebar() {
  const pathname = usePathname();
  const item = (href: string) => ({
    active: pathname?.startsWith(href),
    base:
      "flex items-center gap-3 rounded px-3 py-2 transition hover:bg-white/5",
    activeCls:
      "bg-white/10 border border-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]",
  });

  const d = item("/dashboard");
  const l = item("/library");

  return (
    <aside className="hidden md:block w-64 border-r border-white/10 p-4">
      <div className="text-sm font-semibold mb-3 opacity-70">songEMTI</div>
      <nav className="space-y-1">
        <Link href="/dashboard" className={clsx(d.base, d.active && d.activeCls)}>
          <Home size={18} className="opacity-80" />
          Início
        </Link>
        <Link href="/library" className={clsx(l.base, l.active && l.activeCls)}>
          <Library size={18} className="opacity-80" />
          Biblioteca
        </Link>
      </nav>
    </aside>
  );
}
