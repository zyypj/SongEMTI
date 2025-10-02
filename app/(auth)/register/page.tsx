"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/register", { method: "POST", body: JSON.stringify({ email, password, name }) });
    if (res.ok) router.push("/login");
    else alert(await res.text());
  };

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h2 className="text-2xl font-semibold mb-6">Registrar</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <input className="w-full rounded bg-neutral-900 px-3 py-2 border border-white/10" placeholder="Nome" value={name} onChange={e => setName(e.target.value)} />
        <input className="w-full rounded bg-neutral-900 px-3 py-2 border border-white/10" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full rounded bg-neutral-900 px-3 py-2 border border-white/10" placeholder="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="w-full rounded bg-emerald-500 py-2 font-medium hover:bg-emerald-400">Criar conta</button>
      </form>
    </div>
  );
}
