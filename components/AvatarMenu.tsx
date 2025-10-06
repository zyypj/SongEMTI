"use client";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";

type UserInfo = { image?: string | null; name?: string | null; email?: string | null };

function initials(name?: string | null, email?: string | null) {
  const base = (name || email || "U").trim();
  const parts = base.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return base.slice(0, 2).toUpperCase();
}

export default function AvatarMenu() {
  const { data } = useSession();
  const sessionUser = data?.user;
  const [userInfo, setUserInfo] = useState<UserInfo>({});
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const r = await fetch("/api/user", { cache: "no-store" });
      if (r.ok) {
        const u = (await r.json()) as UserInfo;
        if (alive) setUserInfo(u);
      }
    })();
    return () => { alive = false; };
  }, []);

  const displayName = sessionUser?.name || userInfo.name || sessionUser?.email || userInfo.email || "User";
  const email = sessionUser?.email || userInfo.email || undefined;
  const image = userInfo.image;

  return (
    <div className="ml-auto relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 rounded-full bg-white/5 hover:bg-white/10 px-2 py-1 transition"
        aria-label="Open user menu"
      >
        {image ? (
          <Image
            src={image}
            alt={String(displayName)}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10"
            unoptimized
          />
        ) : (
          <div className="h-8 w-8 rounded-full grid place-items-center bg-emerald-600 text-white text-sm font-semibold">
            {initials(sessionUser?.name ?? userInfo.name, email)}
          </div>
        )}
      </button>

      <div
        className={clsx(
          "absolute right-0 mt-2 w-56 rounded-lg border border-white/10 bg-neutral-950/95 backdrop-blur shadow-xl ring-1 ring-black/40",
          "origin-top-right transition transform",
          open ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        )}
      >
        <div className="p-3 border-b border-white/10">
          <div className="text-sm font-medium truncate">{displayName}</div>
          {email && <div className="text-xs opacity-70 truncate">{email}</div>}
        </div>
        <div className="py-1">
          <Link
            href="/settings"
            prefetch={false}
            className="block px-3 py-2 text-sm hover:bg-white/5 rounded-md"
            onClick={() => setOpen(false)}
          >
            Perfil & Conta
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full text-left block px-3 py-2 text-sm hover:bg-white/5 rounded-md text-rose-300"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
