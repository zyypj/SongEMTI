"use client";
import { signOut } from "next-auth/react";

export default function UserMenu() {
  return (
    <div className="ml-auto">
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="rounded px-3 py-2 text-sm bg-white/10 hover:bg-white/20"
      >
        Sair
      </button>
    </div>
  );
}
