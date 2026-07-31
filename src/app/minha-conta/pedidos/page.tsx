import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBRL, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/lib/order-status";

export const dynamic = "force-dynamic";

export default async function PedidosPage() {
  const session = await auth();
  const orders = await prisma.order.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div>
      <h1 className="font-display text-3xl tracking-wide mb-8">Meus pedidos</h1>
      {orders.length === 0 && <p className="text-furikai-gray-400">Você ainda não fez nenhum pedido.</p>}
      <div className="space-y-4">
        {orders.map((o) => (
          <Link
            key={o.id}
            href={`/minha-conta/pedidos/${o.id}`}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-furikai-gray-700 p-4 hover:border-furikai-white transition-colors"
          >
            <div>
              <p className="text-furikai-white">{o.number}</p>
              <p className="text-xs text-furikai-gray-500">{formatDate(o.createdAt)} · {o.items.length} itens</p>
            </div>
            <div className="flex items-center gap-6">
              <span className={`text-xs uppercase tracking-wide ${ORDER_STATUS_COLOR[o.status]}`}>
                {ORDER_STATUS_LABEL[o.status]}
              </span>
              <span className="text-furikai-white">{formatBRL(Number(o.total))}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
