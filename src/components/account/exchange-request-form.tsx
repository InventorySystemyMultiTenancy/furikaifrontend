"use client";

import { useState } from "react";

export function ExchangeRequestForm({ orderId }: { orderId: string }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/account/exchange-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao solicitar troca.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return <p className="text-sm text-furikai-white">Solicitação de troca enviada. Entraremos em contato.</p>;
  }

  return (
    <div className="space-y-3">
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Descreva o motivo da troca..."
        rows={3}
        className="w-full bg-transparent border border-furikai-gray-700 px-3 py-2 text-sm focus:outline-none focus:border-furikai-white"
      />
      {error && <p className="text-xs text-furikai-red-bright">{error}</p>}
      <button
        onClick={submit}
        disabled={loading || reason.length < 5}
        className="px-5 py-2 border border-furikai-white text-sm uppercase tracking-wide hover:bg-furikai-white hover:text-furikai-black transition-colors disabled:opacity-40"
      >
        Solicitar troca
      </button>
    </div>
  );
}
