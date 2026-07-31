import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBRL, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/lib/order-status";
import { ExchangeRequestForm } from "@/components/account/exchange-request-form";

export const dynamic = "force-dynamic";

export default async function PedidoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const order = await prisma.order.findFirst({
    where: { id, userId: session!.user.id },
    include: { items: true, address: true, exchangeRequests: true },
  });

  if (!order) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-wide">Pedido {order.number}</h1>
          <p className="text-sm text-furikai-gray-500">{formatDate(order.createdAt)}</p>
        </div>
        <span className={`text-sm uppercase tracking-wide ${ORDER_STATUS_COLOR[order.status]}`}>
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </div>

      {order.trackingCode && (
        <div className="border border-furikai-gray-700 p-4 text-sm">
          <p className="text-furikai-gray-400">Rastreamento ({order.carrier ?? "transportadora"})</p>
          <p className="text-furikai-white mt-1">{order.trackingCode}</p>
        </div>
      )}

      <div className="border border-furikai-gray-700 p-4 space-y-2">
        {order.items.map((i) => (
          <div key={i.id} className="flex justify-between text-sm">
            <span>{i.quantity}x {i.productName} ({i.variantLabel})</span>
            <span>{formatBRL(Number(i.unitPrice) * i.quantity)}</span>
          </div>
        ))}
        <div className="border-t border-white/10 pt-2 flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatBRL(Number(order.subtotal))}</span>
        </div>
        {Number(order.discount) > 0 && (
          <div className="flex justify-between text-sm">
            <span>Desconto</span>
            <span>- {formatBRL(Number(order.discount))}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span>Frete</span>
          <span>{formatBRL(Number(order.shippingCost))}</span>
        </div>
        <div className="flex justify-between text-base border-t border-white/10 pt-2">
          <span>Total</span>
          <span className="text-furikai-white">{formatBRL(Number(order.total))}</span>
        </div>
      </div>

      {order.address && (
        <div className="border border-furikai-gray-700 p-4 text-sm">
          <p className="text-furikai-gray-400 mb-1">Endereço de entrega</p>
          <p>
            {order.address.street}, {order.address.number} — {order.address.neighborhood},{" "}
            {order.address.city}/{order.address.state} — {order.address.zip}
          </p>
        </div>
      )}

      <a
        href={`/api/account/orders/${order.id}/receipt`}
        className="inline-block px-6 py-3 border border-furikai-white text-sm uppercase tracking-wider hover:bg-furikai-white hover:text-furikai-black transition-colors"
      >
        Baixar comprovante
      </a>

      {order.status === "DELIVERED" && (
        <div>
          <h2 className="font-display text-xl tracking-wide mb-3">Solicitar troca</h2>
          {order.exchangeRequests.length > 0 ? (
            <p className="text-sm text-furikai-gray-400">
              Solicitação já enviada — status: {order.exchangeRequests[0].status}
            </p>
          ) : (
            <ExchangeRequestForm orderId={order.id} />
          )}
        </div>
      )}

      <Link href="/minha-conta/pedidos" className="text-sm text-furikai-gray-400 hover:text-furikai-white">
        ← Voltar para pedidos
      </Link>
    </div>
  );
}
