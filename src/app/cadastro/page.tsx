"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell, inputClass, primaryButtonClass } from "@/components/ui/auth-shell";

export default function CadastroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
      setTimeout(() => router.push("/entrar"), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao cadastrar.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <AuthShell title="Quase lá" subtitle="Enviamos um e-mail de confirmação para sua caixa de entrada.">
        <p className="text-sm text-furikai-gray-400 text-center">Redirecionando para o login...</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Criar conta" subtitle="Junte-se ao clube Furikai">
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          required
          placeholder="Nome completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
        <input
          type="email"
          required
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
        <input
          type="password"
          required
          placeholder="Senha (mín. 8 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        {error && <p className="text-xs text-furikai-red-bright">{error}</p>}
        <button type="submit" disabled={loading} className={primaryButtonClass}>
          {loading ? "Criando conta..." : "Criar conta"}
        </button>
      </form>
      <p className="text-xs text-furikai-gray-400 mt-4 text-center">
        Já tem conta?{" "}
        <Link href="/entrar" className="text-furikai-white hover:underline">
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}
