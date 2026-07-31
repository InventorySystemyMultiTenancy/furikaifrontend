"use client";

import { useState } from "react";
import { formatBRL } from "@/lib/utils";

type Quote = { service: string; label: string; price: number; etaDaysMin: number; etaDaysMax: number };

export function ShippingCalculator({ quantity = 1 }: { quantity?: number }) {
  const [zip, setZip] = useState("");
  const [quotes, setQuotes] = useState<Quote[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function calculate() {
    const clean = zip.replace(/\D/g, "");
    if (clean.length !== 8) {
      setError("Digite um CEP válido (8 dígitos).");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/shipping?zip=${clean}&items=${quantity}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuotes(data.quotes);
    } catch {
      setError("Não foi possível calcular o frete.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-furikai-gray-700 p-4">
      <p className="text-sm mb-2 text-furikai-white">Calcular frete e prazo</p>
      <div className="flex gap-2">
        <input
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          placeholder="00000-000"
          maxLength={9}
          className="flex-1 bg-transparent border border-furikai-gray-700 px-3 py-2 text-sm focus:outline-none focus:border-furikai-white"
        />
        <button
          onClick={calculate}
          disabled={loading}
          className="px-4 py-2 border border-furikai-white text-sm uppercase tracking-wide hover:bg-furikai-white hover:text-furikai-black transition-colors disabled:opacity-50"
        >
          {loading ? "..." : "Calcular"}
        </button>
      </div>
      {error && <p className="text-xs text-furikai-red-bright mt-2">{error}</p>}
      {quotes && (
        <ul className="mt-3 space-y-2">
          {quotes.map((q) => (
            <li key={q.service} className="flex justify-between text-sm text-furikai-gray-300">
              <span>
                {q.label} ({q.etaDaysMin}-{q.etaDaysMax} dias úteis)
              </span>
              <span className="text-furikai-white">{formatBRL(q.price)}</span>
            </li>
          ))}
        </ul>
      )}
      <a
        href="https://buscacepinter.correios.com.br/app/endereco/index.php"
        target="_blank"
        rel="noreferrer"
        className="text-xs text-furikai-gray-500 underline mt-2 inline-block"
      >
        Não sei meu CEP
      </a>
    </div>
  );
}
