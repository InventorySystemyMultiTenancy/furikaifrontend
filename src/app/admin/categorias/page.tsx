"use client";

import { useEffect, useState } from "react";

type Category = { id: string; name: string; slug: string; _count: { products: number } };

export default function AdminCategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function load() {
    fetch("/api/admin/categories").then((r) => r.json()).then((d) => setCategories(d.categories ?? []));
  }
  useEffect(load, []);

  async function create() {
    setError("");
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setName("");
    load();
  }

  async function remove(id: string) {
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) setError(data.error);
    load();
  }

  return (
    <div className="space-y-8 max-w-lg">
      <h1 className="font-display text-3xl tracking-wide">Categorias</h1>
      <div className="flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da categoria" className="flex-1 bg-transparent border border-furikai-gray-700 px-3 py-2 text-sm" />
        <button onClick={create} className="px-5 py-2 bg-furikai-white text-furikai-black text-xs uppercase tracking-wide">
          Criar
        </button>
      </div>
      {error && <p className="text-xs text-furikai-red-bright">{error}</p>}
      <div className="space-y-2">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between border border-furikai-gray-700 p-3 text-sm">
            <span>{c.name} <span className="text-xs text-furikai-gray-500">({c._count.products} produtos)</span></span>
            <button onClick={() => remove(c.id)} className="text-xs text-furikai-gray-500 hover:text-furikai-red-bright">
              Excluir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
