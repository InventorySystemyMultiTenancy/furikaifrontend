"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatBRL } from "@/lib/utils";

type PriceResult = {
  subtotal: number;
  discount: number;
  total: number;
  errors: string[];
};

export default function CarrinhoPage() {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const couponCode = useCartStore((s) => s.couponCode);
  const applyCoupon = useCartStore((s) => s.applyCoupon);

  const [couponInput, setCouponInput] = useState(couponCode ?? "");
  const [pricing, setPricing] = useState<PriceResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      setPricing(null);
      return;
    }
    setLoading(true);
    fetch("/api/cart/price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        couponCode,
      }),
    })
      .then((r) => r.json())
      .then(setPricing)
      .finally(() => setLoading(false));
  }, [items, couponCode]);

  return (
    <div className="pt-32 pb-24 px-6 lg:px-10 min-h-[60vh]">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-4xl tracking-wide mb-10">Carrinho</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-furikai-gray-400 mb-6">Seu carrinho está vazio.</p>
            <Link
              href="/produtos"
              className="px-8 py-3 border border-furikai-white text-sm uppercase tracking-wider hover:bg-furikai-white hover:text-furikai-black transition-colors"
            >
              Explorar coleção
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-4 border-b border-white/5 pb-6">
                  <div className="relative w-24 h-32 bg-furikai-gray-900 flex-shrink-0 overflow-hidden">
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Link href={`/produtos/${item.slug}`} className="text-furikai-white hover:underline">
                      {item.name}
                    </Link>
                    <p className="text-sm text-furikai-gray-500 mt-1">
                      {[item.color, item.size].filter(Boolean).join(" / ")}
                    </p>
                    <p className="mt-2">{formatBRL(item.price)}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center border border-furikai-gray-700">
                        <button
                          className="px-2 py-1"
                          onClick={() => setQuantity(item.variantId, Math.max(1, item.quantity - 1))}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 text-sm">{item.quantity}</span>
                        <button
                          className="px-2 py-1"
                          onClick={() =>
                            setQuantity(item.variantId, Math.min(item.stock || 20, item.quantity + 1))
                          }
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="text-furikai-gray-500 hover:text-furikai-red-bright flex items-center gap-1 text-xs uppercase"
                      >
                        <Trash2 size={14} /> Remover
                      </button>
                    </div>
                  </div>
                  <p className="text-furikai-white">{formatBRL(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="border border-furikai-gray-700 p-6 h-fit space-y-4">
              <h2 className="font-display text-xl tracking-wide">Resumo</h2>

              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Cupom de desconto"
                  className="flex-1 bg-transparent border border-furikai-gray-700 px-3 py-2 text-sm focus:outline-none focus:border-furikai-white"
                />
                <button
                  onClick={() => applyCoupon(couponInput || null)}
                  className="px-4 py-2 border border-furikai-white text-xs uppercase tracking-wide hover:bg-furikai-white hover:text-furikai-black"
                >
                  Aplicar
                </button>
              </div>

              {pricing?.errors?.map((e) => (
                <p key={e} className="text-xs text-furikai-red-bright">{e}</p>
              ))}

              <div className="space-y-2 text-sm pt-2 border-t border-white/10">
                <div className="flex justify-between">
                  <span className="text-furikai-gray-400">Subtotal</span>
                  <span>{loading ? "..." : formatBRL(pricing?.subtotal ?? 0)}</span>
                </div>
                {(pricing?.discount ?? 0) > 0 && (
                  <div className="flex justify-between text-furikai-white">
                    <span className="text-furikai-gray-400">Desconto</span>
                    <span>- {formatBRL(pricing?.discount ?? 0)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-furikai-gray-400">Frete</span>
                  <span className="text-xs text-furikai-gray-500">calculado no checkout</span>
                </div>
                <div className="flex justify-between text-base pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-furikai-white">{loading ? "..." : formatBRL(pricing?.total ?? 0)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="block text-center w-full py-3 bg-furikai-red-bright text-sm uppercase tracking-wider hover:bg-furikai-red transition-colors"
              >
                Finalizar compra
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
