"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus } from "lucide-react";
import { formatBRL, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useFavoritesStore } from "@/store/favorites";
import { useFavoriteToggle } from "@/hooks/use-favorite-toggle";
import { ShippingCalculator } from "./shipping-calculator";
import type { SerializedProduct } from "@/lib/serialize";

export function ProductDetail({ product }: { product: SerializedProduct }) {
  const colors = useMemo(
    () => Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean))) as string[],
    [product.variants]
  );
  const [color, setColor] = useState<string | undefined>(colors[0]);
  const [size, setSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<"description" | "composition" | "sizeGuide">("description");
  const router = useRouter();

  const addItem = useCartStore((s) => s.addItem);
  const toggleFavorite = useFavoriteToggle();
  const isFavorite = useFavoritesStore((s) => s.has(product.id));

  const availableSizes = product.variants.filter((v) => !color || v.color === color);
  const selectedVariant = product.variants.find(
    (v) => (!color || v.color === color) && v.size === size
  );

  function buildLine() {
    if (!selectedVariant) return null;
    return {
      variantId: selectedVariant.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0]?.url ?? "",
      color: selectedVariant.color ?? undefined,
      size: selectedVariant.size,
      price: product.finalPrice,
      stock: selectedVariant.stock,
      quantity,
    };
  }

  function handleAddToCart() {
    const line = buildLine();
    if (!line) return;
    addItem(line);
  }

  function handleBuyNow() {
    const line = buildLine();
    if (!line) return;
    addItem(line);
    router.push("/checkout");
  }

  return (
    <div className="space-y-6">
      <div>
        {product.category && (
          <p className="text-xs uppercase tracking-widest text-furikai-gray-500 mb-2">
            {product.category.name}
          </p>
        )}
        <h1 className="font-display text-3xl md:text-4xl tracking-wide">{product.name}</h1>
        <div className="flex items-center gap-3 mt-3">
          {product.discountPrice ? (
            <>
              <span className="text-2xl text-furikai-white">{formatBRL(product.discountPrice)}</span>
              <span className="text-base text-furikai-gray-500 line-through">
                {formatBRL(product.price)}
              </span>
              <span className="text-xs bg-furikai-red-bright px-2 py-1">
                -{product.discountPercent}%
              </span>
            </>
          ) : (
            <span className="text-2xl text-furikai-white">{formatBRL(product.price)}</span>
          )}
        </div>
        <p className="text-xs text-furikai-gray-500 mt-1">até 3x sem juros no cartão</p>
      </div>

      {colors.length > 0 && (
        <div>
          <p className="text-sm text-furikai-gray-300 mb-2">Cor: {color}</p>
          <div className="flex gap-2">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  setSize(undefined);
                }}
                className={cn(
                  "px-3 py-2 text-xs border uppercase tracking-wide",
                  color === c ? "border-furikai-white" : "border-furikai-gray-700 text-furikai-gray-400"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-sm text-furikai-gray-300 mb-2">Tamanho</p>
        <div className="flex flex-wrap gap-2">
          {availableSizes.map((v) => (
            <button
              key={v.id}
              disabled={v.stock === 0}
              onClick={() => setSize(v.size)}
              className={cn(
                "min-w-11 px-3 py-2 text-sm border uppercase tracking-wide disabled:opacity-30 disabled:cursor-not-allowed",
                size === v.size ? "border-furikai-white bg-furikai-white text-furikai-black" : "border-furikai-gray-700"
              )}
            >
              {v.size}
            </button>
          ))}
        </div>
        {selectedVariant && (
          <p className="text-xs text-furikai-gray-500 mt-2">
            {selectedVariant.stock > 5
              ? "Em estoque"
              : selectedVariant.stock > 0
              ? `Últimas ${selectedVariant.stock} unidades`
              : "Esgotado"}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center border border-furikai-gray-700">
          <button
            className="px-3 py-2 hover:bg-white/5"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Minus size={14} />
          </button>
          <span className="px-4 text-sm">{quantity}</span>
          <button
            className="px-3 py-2 hover:bg-white/5"
            onClick={() =>
              setQuantity((q) => Math.min(selectedVariant?.stock ?? 20, q + 1))
            }
          >
            <Plus size={14} />
          </button>
        </div>
        <button
          onClick={() => toggleFavorite(product.id)}
          className="p-3 border border-furikai-gray-700 hover:border-furikai-white"
          aria-label="Favoritar"
        >
          <Heart size={18} className={isFavorite ? "fill-furikai-red-bright text-furikai-red-bright" : ""} />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleAddToCart}
          disabled={!selectedVariant || selectedVariant.stock === 0}
          className="flex-1 py-3.5 border border-furikai-white text-sm uppercase tracking-wider hover:bg-furikai-white hover:text-furikai-black transition-colors disabled:opacity-40"
        >
          Adicionar ao carrinho
        </button>
        <button
          onClick={handleBuyNow}
          disabled={!selectedVariant || selectedVariant.stock === 0}
          className="flex-1 py-3.5 bg-furikai-red-bright text-sm uppercase tracking-wider hover:bg-furikai-red transition-colors disabled:opacity-40"
        >
          Comprar agora
        </button>
      </div>

      <ShippingCalculator quantity={quantity} />

      <div>
        <div className="flex gap-6 border-b border-white/10 text-sm">
          {(["description", "composition", "sizeGuide"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "py-3 uppercase tracking-wide",
                tab === t ? "text-furikai-white border-b-2 border-furikai-white" : "text-furikai-gray-500"
              )}
            >
              {t === "description" ? "Descrição" : t === "composition" ? "Composição" : "Medidas"}
            </button>
          ))}
        </div>
        <div className="py-5 text-sm text-furikai-gray-300 leading-relaxed whitespace-pre-line">
          {tab === "description" && product.description}
          {tab === "composition" && (product.composition || "Informação não disponível.")}
          {tab === "sizeGuide" && (product.sizeGuide || "Consulte a tabela de medidas padrão Furikai.")}
        </div>
      </div>
    </div>
  );
}
