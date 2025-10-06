"use client";
import { useEffect, useState } from "react";

type UserInfo = {
  email: string;
  name?: string | null;
  username?: string | null;
  image?: string | null;
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [me, setMe] = useState<UserInfo>({ email: "" });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const r = await fetch("/api/user", { cache: "no-store" });
      if (r.ok) {
        const data = await r.json();
        setMe({ email: data.email, name: data.name, username: data.username, image: data.image });
      }
      setLoading(false);
    })();
  }, []);

  async function saveProfile() {
    setSaving(true);
    const r = await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(me),
    });
    setSaving(false);
    if (!r.ok) {
      const msg = await r.text();
      alert(msg || "Falha ao salvar");
      return;
    }
    alert("Perfil atualizado!");
  }

  async function changePassword() {
    if (!currentPassword || !newPassword) return alert("Preencha as senhas");
    if (newPassword !== confirmNew) return alert("As novas senhas não coincidem");
    setSaving(true);
    const r = await fetch("/api/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setSaving(false);
    if (!r.ok) {
      const msg = await r.text();
      alert(msg || "Falha ao alterar senha");
      return;
    }
    setCurrentPassword(""); setNewPassword(""); setConfirmNew("");
    alert("Senha alterada!");
  }

  async function fileToDataURL(file: File) {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function resizeDataURL(dataUrl: string, maxSide = 256, quality = 0.85) {
    const img = new Image();
    img.src = dataUrl;
    await new Promise(r => { img.onload = () => r(null); });

    const w = img.width, h = img.height;
    const scale = Math.min(1, maxSide / Math.max(w, h));
    const cw = Math.round(w * scale), ch = Math.round(h * scale);

    const canvas = document.createElement("canvas");
    canvas.width = cw; canvas.height = ch;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, cw, ch);

    return canvas.toDataURL("image/jpeg", quality);
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^image\//.test(f.type)) return alert("Selecione uma imagem");

    const raw = await fileToDataURL(f);
    const small = await resizeDataURL(raw, 256, 0.85);

    const b64SizeKB = Math.round((small.length * 3) / 4 / 1024);
    if (b64SizeKB > 200) return alert("Imagem muito grande após reduzir (limite ~200KB).");

    setMe(m => ({ ...m, image: small }));
  }

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Perfil & Conta</h1>
      <p className="opacity-70 mt-1">Atualize suas informações e personalize seu perfil.</p>

      <div className="grid gap-6 mt-6 md:grid-cols-2">
        {/* Perfil */}
        <section className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <h2 className="text-lg font-semibold mb-4">Informações básicas</h2>

          <div className="flex items-center gap-4 mb-4">
            {me.image ? (
              <img src={me.image} alt="Avatar" className="h-16 w-16 rounded-full object-cover ring-1 ring-white/10" />
            ) : (
              <div className="h-16 w-16 rounded-full grid place-items-center bg-emerald-600 text-white font-semibold">🙂</div>
            )}
            <div>
              <label className="text-sm opacity-70">Foto de perfil</label>
              <div className="mt-2 flex items-center gap-3">
                <input type="file" accept="image/*" onChange={onPickFile} className="text-sm" />
                <button
                  onClick={()=> setMe(m => ({ ...m, image: "" }))}
                  className="text-sm px-3 py-1 rounded bg-white/10 hover:bg-white/20"
                >
                  Remover
                </button>
              </div>
              <div className="text-xs opacity-60 mt-1">PNG/JPG recomendados. Tamanhos pequenos carregam mais rápido.</div>
            </div>
          </div>

          <div className="grid gap-3">
            <label className="text-sm">
              <span className="block mb-1 opacity-80">Nome</span>
              <input
                value={me.name || ""} onChange={e=>setMe(m=>({...m, name:e.target.value}))}
                className="w-full rounded bg-neutral-900 px-3 py-2 border border-white/10"
                placeholder="Seu nome"
              />
            </label>

            <label className="text-sm">
              <span className="block mb-1 opacity-80">Username</span>
              <input
                value={me.username || ""} onChange={e=>setMe(m=>({...m, username:e.target.value.trim()}))}
                className="w-full rounded bg-neutral-900 px-3 py-2 border border-white/10"
                placeholder="ex.: joaopedro"
              />
              <span className="text-xs opacity-60">Deve ser único.</span>
            </label>

            <label className="text-sm">
              <span className="block mb-1 opacity-80">Email</span>
              <input
                type="email"
                value={me.email} onChange={e=>setMe(m=>({...m, email:e.target.value.trim()}))}
                className="w-full rounded bg-neutral-900 px-3 py-2 border border-white/10"
                placeholder="nome@exemplo.com"
              />
            </label>
          </div>

          <div className="mt-4">
            <button
              disabled={saving}
              onClick={saveProfile}
              className="rounded bg-emerald-500 px-5 py-2 hover:bg-emerald-400 disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </section>

        {/* Senha */}
        <section className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <h2 className="text-lg font-semibold mb-4">Alterar senha</h2>

          <div className="grid gap-3">
            <label className="text-sm">
              <span className="block mb-1 opacity-80">Senha atual</span>
              <input
                type="password"
                value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)}
                className="w-full rounded bg-neutral-900 px-3 py-2 border border-white/10"
                placeholder="••••••••"
              />
            </label>

            <label className="text-sm">
              <span className="block mb-1 opacity-80">Nova senha</span>
              <input
                type="password"
                value={newPassword} onChange={e=>setNewPassword(e.target.value)}
                className="w-full rounded bg-neutral-900 px-3 py-2 border border-white/10"
                placeholder="••••••••"
              />
            </label>

            <label className="text-sm">
              <span className="block mb-1 opacity-80">Confirmar nova senha</span>
              <input
                type="password"
                value={confirmNew} onChange={e=>setConfirmNew(e.target.value)}
                className="w-full rounded bg-neutral-900 px-3 py-2 border border-white/10"
                placeholder="••••••••"
              />
            </label>
          </div>

          <div className="mt-4">
            <button
              disabled={saving}
              onClick={changePassword}
              className="rounded bg-white/10 px-5 py-2 hover:bg-white/20 disabled:opacity-60"
            >
              {saving ? "Alterando..." : "Alterar senha"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
