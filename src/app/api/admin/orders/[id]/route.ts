import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      address: true,
      payments: true,
      coupon: true,
      user: { select: { name: true, email: true, phone: true } },
    },
  });
  if (!order) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });

  return NextResponse.json({
    order: {
      ...order,
      subtotal: Number(order.subtotal),
      discount: Number(order.discount),
      shippingCost: Number(order.shippingCost),
      total: Number(order.total),
      items: order.items.map((i) => ({ ...i, unitPrice: Number(i.unitPrice), unitCost: Number(i.unitCost) })),
      payments: order.payments.map((p) => ({ ...p, amount: Number(p.amount), feeAmount: Number(p.feeAmount) })),
    },
  });
}

const patchSchema = z.object({
  status: z
    .enum(["AWAITING_PAYMENT", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"])
    .optional(),
  trackingCode: z.string().optional(),
  carrier: z.string().optional(),
  notes: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });

  const restockStatuses = ["CANCELLED", "REFUNDED"];
  const shouldRestock =
    parsed.data.status &&
    restockStatuses.includes(parsed.data.status) &&
    !restockStatuses.includes(order.status);

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id }, data: parsed.data });

    if (shouldRestock) {
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }
      if (parsed.data.status === "REFUNDED") {
        await tx.financialMovement.create({
          data: {
            type: "ORDER_REFUND",
            amount: -Number(order.total),
            date: new Date(),
            description: `Reembolso manual — pedido ${order.number}`,
            orderId: order.id,
            createdById: session!.user.id,
          },
        });
      }
    }
  });

  await logAdminAction({
    userId: session!.user.id,
    action: "UPDATE_ORDER",
    entityType: "Order",
    entityId: id,
    details: parsed.data,
  });

  return NextResponse.json({ ok: true });
}
