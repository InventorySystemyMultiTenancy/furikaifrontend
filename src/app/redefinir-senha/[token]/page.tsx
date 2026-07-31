"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell, inputClass, primaryButtonClass } from "@/components/ui/auth-shell";

export default function RedefinirSenhaPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
      setTimeout(() => router.push("/entrar"), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao redefinir senha.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <AuthShell title="Senha redefinida" subtitle="Redirecionando para o login...">
        <div />
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Nova senha" subtitle="Escolha uma nova senha para sua conta">
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="password"
          required
          placeholder="Nova senha (mín. 8 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        {error && <p className="text-xs text-furikai-red-bright">{error}</p>}
        <button type="submit" disabled={loading} className={primaryButtonClass}>
          {loading ? "Salvando..." : "Redefinir senha"}
        </button>
      </form>
    </AuthShell>
  );
}
