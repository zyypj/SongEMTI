"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library } from "lucide-react";

export default function MobileTopNav() {
  const pathname = usePathname();
  const isHome = pathname?.startsWith("/dashboard");
  const isLibrary = pathname?.startsWith("/library");

  const cls = (active: boolean) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
      active ? "bg-zinc-800 text-white" : "text-zinc-300 hover:bg-zinc-800/60"
    }`;

  return (
    <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-zinc-900/90 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/80 border-b border-zinc-800">
      <div className="mx-auto max-w-screen-sm px-3 py-2 flex items-center justify-between">
        {/* Home deve ir para /dashboard */}
        <Link href="/dashboard" className={cls(!!isHome)} aria-label="Home">
          <Home size={18} aria-hidden="true" />
          <span>Início</span>
        </Link>

        <Link href="/library" className={cls(!!isLibrary)} aria-label="Library">
          <Library size={18} aria-hidden="true" />
          <span>Biblioteca</span>
        </Link>
      </div>
    </div>
  );
}
