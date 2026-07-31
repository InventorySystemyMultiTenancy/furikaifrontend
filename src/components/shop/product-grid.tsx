"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "./product-card";
import type { SerializedProduct } from "@/lib/serialize";
import { cn } from "@/lib/utils";

type FilterOption = { slug: string; name: string };

export function ProductGrid({
  categorySlug,
  collectionSlug,
  featuredOnly,
  showFilters = true,
  title,
  categories = [],
  collections = [],
  pageSize = 12,
}: {
  categorySlug?: string;
  collectionSlug?: string;
  featuredOnly?: boolean;
  showFilters?: boolean;
  title?: string;
  categories?: FilterOption[];
  collections?: FilterOption[];
  pageSize?: number;
}) {
  const [items, setItems] = useState<SerializedProduct[]>([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("relevance");
  const [category, setCategory] = useState(categorySlug ?? "");
  const [collection, setCollection] = useState(collectionSlug ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (collection) params.set("collection", collection);
    if (search) params.set("q", search);
    if (sort !== "relevance") params.set("sort", sort);
    if (featuredOnly) params.set("featured", "true");
    params.set("limit", String(pageSize));
    return params;
  }, [category, collection, search, sort, featuredOnly, pageSize]);

  const fetchPage = useCallback(
    async (pageNumber: number, replace: boolean) => {
      setLoading(true);
      const params = new URLSearchParams(query);
      params.set("page", String(pageNumber));
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setItems((prev) => (replace ? data.items : [...prev, ...data.items]));
      setPageCount(data.pageCount);
      setPage(pageNumber);
      setLoading(false);
    },
    [query]
  );

  useEffect(() => {
    fetchPage(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div>
      {(title || showFilters) && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          {title && <h2 className="font-display text-3xl md:text-5xl tracking-wide">{title}</h2>}
          {showFilters && (
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className="md:hidden flex items-center gap-2 text-sm uppercase tracking-wide border border-furikai-gray-700 px-3 py-2 self-start"
            >
              <SlidersHorizontal size={14} /> Filtros
            </button>
          )}
        </div>
      )}

      {showFilters && (
        <div
          className={cn(
            "flex-col md:flex-row md:flex flex-wrap items-stretch md:items-center gap-3 mb-10",
            filtersOpen ? "flex" : "hidden md:flex"
          )}
        >
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-furikai-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produtos..."
              className="w-full bg-transparent border border-furikai-gray-700 pl-9 pr-3 py-2.5 text-sm placeholder:text-furikai-gray-500 focus:outline-none focus:border-furikai-white"
            />
          </div>

          {categories.length > 0 && (
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-furikai-black border border-furikai-gray-700 px-3 py-2.5 text-sm focus:outline-none focus:border-furikai-white"
            >
              <option value="">Todas categorias</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          {collections.length > 0 && (
            <select
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              className="bg-furikai-black border border-furikai-gray-700 px-3 py-2.5 text-sm focus:outline-none focus:border-furikai-white"
            >
              <option value="">Todas coleções</option>
              {collections.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-furikai-black border border-furikai-gray-700 px-3 py-2.5 text-sm focus:outline-none focus:border-furikai-white"
          >
            <option value="relevance">Relevância</option>
            <option value="newest">Mais recentes</option>
            <option value="price-asc">Menor preço</option>
            <option value="price-desc">Maior preço</option>
          </select>
        </div>
      )}

      {!loading && items.length === 0 && (
        <p className="text-furikai-gray-400 text-center py-20">Nenhum produto encontrado.</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
        {items.map((product, i) => (
          <div
            key={product.id}
            className="animate-[fadeUp_0.6s_ease-out_both]"
            style={{ animationDelay: `${(i % pageSize) * 40}ms` }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 mt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-furikai-gray-900 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && page < pageCount && (
        <div className="flex justify-center mt-14">
          <button
            onClick={() => fetchPage(page + 1, false)}
            className="px-8 py-3 border border-furikai-white text-sm uppercase tracking-wider hover:bg-furikai-white hover:text-furikai-black transition-colors"
          >
            Carregar mais
          </button>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
