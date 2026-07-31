"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatBRL } from "@/lib/utils";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  active: boolean;
  featured: boolean;
  limitedEdition: boolean;
  totalStock: number;
  category: string | null;
  image: string | null;
};

export default function AdminProdutosPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    fetch(`/api/admin/products?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []));
  }, [search]);

  async function toggleActive(id: string, active: boolean) {
    await fetch(`/api/admin/products/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active: !active } : p)));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-display text-3xl tracking-wide">Produtos</h1>
        <Link href="/admin/produtos/novo" className="px-4 py-2 bg-furikai-white text-furikai-black text-xs uppercase tracking-wide">
          + Novo produto
        </Link>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar produtos"
        className="w-full max-w-md bg-transparent border border-furikai-gray-700 px-3 py-2 text-sm"
      />

      <div className="grid grid-cols-1 gap-3">
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-4 border border-furikai-gray-700 p-3">
            <div className="relative w-14 h-16 bg-furikai-gray-900 flex-shrink-0">
              {p.image && <Image src={p.image} alt={p.name} fill className="object-cover" sizes="56px" />}
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/admin/produtos/${p.id}`} className="text-furikai-white hover:underline">
                {p.name}
              </Link>
              <p className="text-xs text-furikai-gray-500">{p.category ?? "Sem categoria"} · Estoque: {p.totalStock}</p>
            </div>
            <p className="text-sm">{formatBRL(p.discountPrice ?? p.price)}</p>
            <button
              onClick={() => toggleActive(p.id, p.active)}
              className={`text-xs uppercase px-3 py-1.5 border ${p.active ? "border-green-400 text-green-400" : "border-furikai-gray-700 text-furikai-gray-500"}`}
            >
              {p.active ? "Ativo" : "Inativo"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
