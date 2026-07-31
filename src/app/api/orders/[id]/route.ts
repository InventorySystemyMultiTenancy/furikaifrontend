import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await params;

  const isStaff = session.user.role === "ADMIN" || session.user.role === "STAFF";

  const order = await prisma.order.findFirst({
    where: isStaff ? { id } : { id, userId: session.user.id },
    include: { items: true, address: true, payments: true, coupon: true },
  });

  if (!order) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });

  return NextResponse.json({
    order: {
      id: order.id,
      number: order.number,
      status: order.status,
      subtotal: Number(order.subtotal),
      discount: Number(order.discount),
      shippingCost: Number(order.shippingCost),
      total: Number(order.total),
      trackingCode: order.trackingCode,
      carrier: order.carrier,
      createdAt: order.createdAt.toISOString(),
      address: order.address,
      items: order.items.map((i) => ({
        productName: i.productName,
        variantLabel: i.variantLabel,
        unitPrice: Number(i.unitPrice),
        quantity: i.quantity,
      })),
      payments: order.payments.map((p) => ({ method: p.method, status: p.status })),
    },
  });
}
