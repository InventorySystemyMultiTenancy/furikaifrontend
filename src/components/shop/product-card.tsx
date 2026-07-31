"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { formatBRL, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useFavoritesStore } from "@/store/favorites";
import { useFavoriteToggle } from "@/hooks/use-favorite-toggle";
import type { SerializedProduct } from "@/lib/serialize";

export function ProductCard({ product }: { product: SerializedProduct }) {
  const [quickBuyOpen, setQuickBuyOpen] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const toggleFavorite = useFavoriteToggle();
  const isFavorite = useFavoritesStore((s) => s.has(product.id));

  const primaryImage = product.images[0]?.url;
  const secondaryImage = product.images[1]?.url ?? primaryImage;

  function quickAdd(size: string) {
    const variant = product.variants.find((v) => v.size === size && v.stock > 0);
    if (!variant) return;
    addItem({
      variantId: variant.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: primaryImage ?? "",
      color: variant.color ?? undefined,
      size: variant.size,
      price: product.finalPrice,
      stock: variant.stock,
      quantity: 1,
    });
    setQuickBuyOpen(false);
  }

  return (
    <div className="group relative flex flex-col">
      <div className="relative aspect-[3/4] bg-furikai-gray-900 overflow-hidden">
        <Link href={`/produtos/${product.slug}`} className="block w-full h-full">
          {primaryImage ? (
            <>
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-opacity duration-500 group-hover:opacity-0"
              />
              <Image
                src={secondaryImage!}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-furikai-gray-700 font-display text-2xl">
              FURIKAI
            </div>
          )}
        </Link>

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && (
            <span className="bg-furikai-white text-furikai-black text-[10px] uppercase tracking-wider px-2 py-1">
              Novo
            </span>
          )}
          {product.limitedEdition && (
            <span className="bg-furikai-red-bright text-furikai-white text-[10px] uppercase tracking-wider px-2 py-1">
              Edição limitada
            </span>
          )}
          {product.discountPercent > 0 && (
            <span className="bg-furikai-gray-700 text-furikai-white text-[10px] uppercase tracking-wider px-2 py-1">
              -{product.discountPercent}%
            </span>
          )}
        </div>

        <button
          onClick={() => toggleFavorite(product.id)}
          aria-label="Favoritar"
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-full hover:bg-black/60"
        >
          <Heart
            size={16}
            className={isFavorite ? "fill-furikai-red-bright text-furikai-red-bright" : "text-white"}
          />
        </button>

        <div
          className={cn(
            "absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent transition-transform duration-300",
            "translate-y-full group-hover:translate-y-0"
          )}
        >
          {!quickBuyOpen ? (
            <button
              onClick={() => setQuickBuyOpen(true)}
              disabled={!product.inStock}
              className="w-full flex items-center justify-center gap-2 bg-furikai-white text-furikai-black text-xs uppercase tracking-wider py-2.5 hover:bg-furikai-red-bright hover:text-furikai-white transition-colors disabled:opacity-50"
            >
              <ShoppingBag size={14} />
              {product.inStock ? "Compra rápida" : "Esgotado"}
            </button>
          ) : (
            <div className="flex flex-wrap gap-1.5 justify-center bg-furikai-black/90 p-2">
              {product.sizes.map((size) => {
                const variant = product.variants.find((v) => v.size === size);
                const disabled = !variant || variant.stock === 0;
                return (
                  <button
                    key={size}
                    disabled={disabled}
                    onClick={() => quickAdd(size)}
                    className="min-w-8 px-2 py-1 text-xs border border-furikai-gray-500 text-furikai-white hover:border-furikai-white disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Link href={`/produtos/${product.slug}`} className="mt-3 space-y-1">
        <p className="text-sm text-furikai-white truncate">{product.name}</p>
        <div className="flex items-center gap-2">
          {product.discountPrice ? (
            <>
              <span className="text-sm text-furikai-white">{formatBRL(product.discountPrice)}</span>
              <span className="text-xs text-furikai-gray-500 line-through">
                {formatBRL(product.price)}
              </span>
            </>
          ) : (
            <span className="text-sm text-furikai-white">{formatBRL(product.price)}</span>
          )}
        </div>
        <div className="flex gap-1 text-[11px] text-furikai-gray-500">
          {product.sizes.slice(0, 6).join(" · ")}
        </div>
      </Link>
    </div>
  );
}
