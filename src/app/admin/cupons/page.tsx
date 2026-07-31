"use client";

import { useEffect, useState } from "react";
import { formatBRL } from "@/lib/utils";

type Coupon = {
  id: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
};

export default function AdminCuponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [value, setValue] = useState(10);
  const [maxUses, setMaxUses] = useState("");
  const [error, setError] = useState("");

  function load() {
    fetch("/api/admin/coupons").then((r) => r.json()).then((d) => setCoupons(d.coupons ?? []));
  }
  useEffect(load, []);

  async function create() {
    setError("");
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, type, value, maxUses: maxUses ? Number(maxUses) : null }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setCode("");
    setValue(10);
    setMaxUses("");
    load();
  }

  async function toggle(id: string, active: boolean) {
    await fetch(`/api/admin/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="font-display text-3xl tracking-wide">Cupons</h1>

      <div className="border border-furikai-gray-700 p-4 space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="CÓDIGO" className="bg-transparent border border-furikai-gray-700 px-3 py-2 text-sm" />
          <select value={type} onChange={(e) => setType(e.target.value as "PERCENT" | "FIXED")} className="bg-furikai-black border border-furikai-gray-700 px-3 py-2 text-sm">
            <option value="PERCENT">%</option>
            <option value="FIXED">R$</option>
          </select>
          <input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} placeholder="Valor" className="bg-transparent border border-furikai-gray-700 px-3 py-2 text-sm" />
          <input value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Usos máx (opcional)" className="bg-transparent border border-furikai-gray-700 px-3 py-2 text-sm" />
        </div>
        {error && <p className="text-xs text-furikai-red-bright">{error}</p>}
        <button onClick={create} className="px-5 py-2 bg-furikai-white text-furikai-black text-xs uppercase tracking-wide">
          Criar cupom
        </button>
      </div>

      <div className="space-y-2">
        {coupons.map((c) => (
          <div key={c.id} className="flex items-center justify-between border border-furikai-gray-700 p-3 text-sm">
            <span>
              {c.code} — {c.type === "PERCENT" ? `${c.value}%` : formatBRL(c.value)} · usado {c.usedCount}
              {c.maxUses ? `/${c.maxUses}` : ""}
            </span>
            <div className="flex gap-3 text-xs">
              <button onClick={() => toggle(c.id, c.active)} className={c.active ? "text-green-400" : "text-furikai-gray-500"}>
                {c.active ? "Ativo" : "Inativo"}
              </button>
              <button onClick={() => remove(c.id)} className="text-furikai-gray-500 hover:text-furikai-red-bright">
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
