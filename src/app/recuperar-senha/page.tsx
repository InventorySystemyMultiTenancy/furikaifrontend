"use client";

import { useState } from "react";
import { AuthShell, inputClass, primaryButtonClass } from "@/components/ui/auth-shell";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setDone(true);
  }

  return (
    <AuthShell title="Recuperar senha" subtitle="Enviaremos um link de redefinição para seu e-mail">
      {done ? (
        <p className="text-sm text-furikai-gray-300 text-center">
          Se este e-mail existir em nossa base, você receberá um link em instantes.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
          <button type="submit" disabled={loading} className={primaryButtonClass}>
            {loading ? "Enviando..." : "Enviar link"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
