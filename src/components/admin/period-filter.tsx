"use client";

import { useState } from "react";

export type Period = { from: string; to: string };

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function PeriodFilter({ onChange }: { onChange: (period: Period) => void }) {
  const [preset, setPreset] = useState("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  function apply(p: string) {
    setPreset(p);
    const now = new Date();
    let from = new Date();
    if (p === "day") from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (p === "week") from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (p === "month") from = new Date(now.getFullYear(), now.getMonth(), 1);
    if (p === "year") from = new Date(now.getFullYear(), 0, 1);
    if (p === "custom") return;
    onChange({ from: isoDate(from), to: isoDate(now) });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {[
        { id: "day", label: "Hoje" },
        { id: "week", label: "Semana" },
        { id: "month", label: "Mês" },
        { id: "year", label: "Ano" },
        { id: "custom", label: "Personalizado" },
      ].map((p) => (
        <button
          key={p.id}
          onClick={() => apply(p.id)}
          className={`px-3 py-1.5 text-xs uppercase tracking-wide border ${
            preset === p.id ? "border-furikai-white text-furikai-white" : "border-furikai-gray-700 text-furikai-gray-400"
          }`}
        >
          {p.label}
        </button>
      ))}
      {preset === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="bg-transparent border border-furikai-gray-700 px-2 py-1.5 text-xs"
          />
          <span className="text-furikai-gray-500 text-xs">até</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="bg-transparent border border-furikai-gray-700 px-2 py-1.5 text-xs"
          />
          <button
            onClick={() => customFrom && customTo && onChange({ from: customFrom, to: customTo })}
            className="px-3 py-1.5 text-xs uppercase border border-furikai-white"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}
