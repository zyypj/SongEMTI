"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn("credentials", { email, password, callbackUrl: "/dashboard" });
  };

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h2 className="text-2xl font-semibold mb-6">Entrar</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <input className="w-full rounded bg-neutral-900 px-3 py-2 border border-white/10" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full rounded bg-neutral-900 px-3 py-2 border border-white/10" placeholder="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="w-full rounded bg-emerald-500 py-2 font-medium hover:bg-emerald-400">Entrar</button>
      </form>
      <p className="mt-4 text-sm">Não tem conta? <Link href="/register" className="text-emerald-400 hover:underline">Registrar</Link></p>
    </div>
  );
}
