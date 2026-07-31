"use client";

import { useState } from "react";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";
import { formatDate } from "@/lib/utils";
import { inputClass, primaryButtonClass } from "@/components/ui/auth-shell";

type TrackResult = { number: string; status: string; trackingCode: string | null; carrier: string | null; createdAt: string };

export default function RastreioPage() {
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`/api/track?number=${encodeURIComponent(number)}&email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.order);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao buscar pedido.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-32 pb-24 px-6 min-h-[70vh]">
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-4xl tracking-wide mb-2 text-center">Rastrear pedido</h1>
        <p className="text-sm text-furikai-gray-400 text-center mb-8">
          Informe o número do pedido e o e-mail usado na compra.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="Número do pedido (ex: FRK260731-1234)"
            className={inputClass}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            className={inputClass}
          />
          {error && <p className="text-xs text-furikai-red-bright">{error}</p>}
          <button type="submit" disabled={loading} className={primaryButtonClass}>
            {loading ? "Buscando..." : "Rastrear"}
          </button>
        </form>

        {result && (
          <div className="mt-8 border border-furikai-gray-700 p-5 text-sm space-y-2">
            <p>Pedido: {result.number}</p>
            <p>Status: {ORDER_STATUS_LABEL[result.status]}</p>
            {result.trackingCode && <p>Código de rastreio: {result.trackingCode} ({result.carrier})</p>}
            <p className="text-furikai-gray-500">Realizado em {formatDate(result.createdAt)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
