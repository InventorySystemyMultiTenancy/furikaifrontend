"use client";

import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatBRL, cn } from "@/lib/utils";
import { useEffect } from "react";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.close);
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/60 z-[70] transition-opacity",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={close}
      />
      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-[420px] bg-furikai-black-soft z-[80] border-l border-white/10 transition-transform duration-300 flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-white/10">
          <h2 className="font-display text-xl tracking-wide">Carrinho ({items.length})</h2>
          <button onClick={close} aria-label="Fechar" className="hover:opacity-70">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {items.length === 0 && (
            <p className="text-furikai-gray-300 text-sm mt-10 text-center">
              Seu carrinho está vazio.
            </p>
          )}
          {items.map((item) => (
            <div key={item.variantId} className="flex gap-4">
              <div className="relative w-20 h-24 bg-furikai-gray-900 flex-shrink-0 overflow-hidden">
                {item.image && (
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-furikai-white truncate">{item.name}</p>
                <p className="text-xs text-furikai-gray-500 mt-0.5">
                  {[item.color, item.size].filter(Boolean).join(" / ")}
                </p>
                <p className="text-sm mt-1">{formatBRL(item.price)}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-furikai-gray-700">
                    <button
                      className="px-2 py-1 hover:bg-white/5"
                      onClick={() => setQuantity(item.variantId, Math.max(1, item.quantity - 1))}
                      aria-label="Diminuir quantidade"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="px-3 text-sm">{item.quantity}</span>
                    <button
                      className="px-2 py-1 hover:bg-white/5"
                      onClick={() =>
                        setQuantity(item.variantId, Math.min(item.stock || 20, item.quantity + 1))
                      }
                      aria-label="Aumentar quantidade"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-furikai-gray-500 hover:text-furikai-red-bright"
                    aria-label="Remover"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="border-t border-white/10 px-6 py-5 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-furikai-gray-300">Subtotal</span>
              <span className="text-furikai-white">{formatBRL(subtotal)}</span>
            </div>
            <p className="text-xs text-furikai-gray-500">Frete e descontos calculados no carrinho.</p>
            <Link
              href="/carrinho"
              onClick={close}
              className="block text-center w-full py-3 border border-furikai-white text-furikai-white text-sm uppercase tracking-wider hover:bg-furikai-white hover:text-furikai-black transition-colors"
            >
              Ver carrinho
            </Link>
            <Link
              href="/checkout"
              onClick={close}
              className="block text-center w-full py-3 bg-furikai-red-bright text-furikai-white text-sm uppercase tracking-wider hover:bg-furikai-red transition-colors"
            >
              Finalizar compra
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
