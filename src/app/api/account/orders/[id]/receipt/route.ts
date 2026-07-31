import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBRL, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: { items: true, address: true },
  });
  if (!order) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });

  const lines = [
    "FURIKAI — COMPROVANTE DE PEDIDO",
    "================================",
    `Pedido: ${order.number}`,
    `Data: ${formatDate(order.createdAt)}`,
    `Status: ${ORDER_STATUS_LABEL[order.status]}`,
    "",
    "Itens:",
    ...order.items.map(
      (i) => ` - ${i.quantity}x ${i.productName} (${i.variantLabel}) — ${formatBRL(Number(i.unitPrice))}`
    ),
    "",
    `Subtotal: ${formatBRL(Number(order.subtotal))}`,
    `Desconto: ${formatBRL(Number(order.discount))}`,
    `Frete: ${formatBRL(Number(order.shippingCost))}`,
    `Total: ${formatBRL(Number(order.total))}`,
    "",
    order.address
      ? `Entrega: ${order.address.street}, ${order.address.number} — ${order.address.neighborhood}, ${order.address.city}/${order.address.state} — ${order.address.zip}`
      : "",
    "",
    "Obrigado por fazer parte do clube Furikai.",
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="furikai-pedido-${order.number}.txt"`,
    },
  });
}
