"use client";

import { useEffect, useState } from "react";

type Collection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  active: boolean;
  featured: boolean;
  _count: { products: number };
};

export default function AdminColecoesPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [error, setError] = useState("");

  function load() {
    fetch("/api/admin/collections").then((r) => r.json()).then((d) => setCollections(d.collections ?? []));
  }
  useEffect(load, []);

  async function create() {
    setError("");
    const res = await fetch("/api/admin/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, coverImage }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setName("");
    setDescription("");
    setCoverImage("");
    load();
  }

  async function toggle(id: string, field: "active" | "featured", value: boolean) {
    await fetch(`/api/admin/collections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    load();
  }

  async function remove(id: string) {
    const res = await fetch(`/api/admin/collections/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) setError(data.error);
    load();
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className="font-display text-3xl tracking-wide">Coleções</h1>

      <div className="border border-furikai-gray-700 p-4 space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da coleção" className="w-full bg-transparent border border-furikai-gray-700 px-3 py-2 text-sm" />
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição curta" className="w-full bg-transparent border border-furikai-gray-700 px-3 py-2 text-sm" />
        <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="URL da imagem de capa (via aba Mídia)" className="w-full bg-transparent border border-furikai-gray-700 px-3 py-2 text-sm" />
        {error && <p className="text-xs text-furikai-red-bright">{error}</p>}
        <button onClick={create} className="px-5 py-2 bg-furikai-white text-furikai-black text-xs uppercase tracking-wide">
          Criar coleção
        </button>
      </div>

      <div className="space-y-2">
        {collections.map((c) => (
          <div key={c.id} className="flex items-center justify-between border border-furikai-gray-700 p-3 text-sm">
            <div>
              <p className="text-furikai-white">{c.name}</p>
              <p className="text-xs text-furikai-gray-500">{c._count.products} produtos</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={c.active} onChange={(e) => toggle(c.id, "active", e.target.checked)} /> Ativa
              </label>
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={c.featured} onChange={(e) => toggle(c.id, "featured", e.target.checked)} /> Destaque
              </label>
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
