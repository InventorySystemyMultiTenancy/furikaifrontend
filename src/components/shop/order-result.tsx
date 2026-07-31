"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatBRL } from "@/lib/utils";

type OrderData = {
  number: string;
  status: string;
  total: number;
  items: { productName: string; variantLabel: string; quantity: number }[];
};

export function OrderResult({
  tone,
  title,
  description,
}: {
  tone: "success" | "error" | "pending";
  title: string;
  description: string;
}) {
  const params = useSearchParams();
  const orderId = params.get("order");
  const isDemo = params.get("demo") === "1";
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((data) => setOrder(data.order))
      .catch(() => {});
  }, [orderId]);

  const color =
    tone === "success" ? "text-furikai-white" : tone === "error" ? "text-furikai-red-bright" : "text-furikai-gray-300";

  return (
    <div className="pt-32 pb-24 px-6 lg:px-10 min-h-[70vh] flex items-center justify-center">
      <div className="max-w-lg w-full text-center">
        <h1 className={`font-display text-4xl tracking-wide mb-4 ${color}`}>{title}</h1>
        <p className="text-furikai-gray-300 mb-8">{description}</p>

        {isDemo && (
          <p className="text-xs text-furikai-gray-500 border border-furikai-gray-700 p-3 mb-8">
            Modo de demonstração: nenhum gateway de pagamento foi configurado ainda
            (MERCADOPAGO_ACCESS_TOKEN). O pedido foi criado normalmente no banco de dados.
          </p>
        )}

        {order && (
          <div className="border border-furikai-gray-700 p-5 text-left mb-8 space-y-2">
            <p className="text-sm text-furikai-white">Pedido {order.number}</p>
            {order.items.map((i, idx) => (
              <p key={idx} className="text-xs text-furikai-gray-400">
                {i.quantity}x {i.productName} ({i.variantLabel})
              </p>
            ))}
            <p className="text-sm pt-2 border-t border-white/10">Total: {formatBRL(order.total)}</p>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Link href="/minha-conta/pedidos" className="px-6 py-3 border border-furikai-white text-sm uppercase tracking-wider hover:bg-furikai-white hover:text-furikai-black transition-colors">
            Meus pedidos
          </Link>
          <Link href="/produtos" className="px-6 py-3 bg-furikai-red-bright text-sm uppercase tracking-wider hover:bg-furikai-red transition-colors">
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
