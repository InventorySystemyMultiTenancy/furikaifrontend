"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/shop/product-card";
import type { SerializedProduct } from "@/lib/serialize";

export default function FavoritosPage() {
  const [products, setProducts] = useState<SerializedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data) => setProducts(data.favorites ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl tracking-wide mb-8">Favoritos</h1>
      {!loading && products.length === 0 && (
        <p className="text-furikai-gray-400">Você ainda não favoritou nenhum produto.</p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
