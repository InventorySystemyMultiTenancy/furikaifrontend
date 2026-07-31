import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayment } from "@/lib/mercadopago";
import { toDecimal } from "@/lib/pricing";

/**
 * Webhook do Mercado Pago. Por segurança, NUNCA confiamos no status vindo
 * diretamente da notificação — sempre buscamos o pagamento na API oficial
 * usando o access token antes de atualizar o pedido.
 */
async function handleNotification(paymentId: string | null) {
  if (!paymentId) return NextResponse.json({ ok: true });

  const payment = await getPayment(paymentId);
  const orderId = payment.external_reference;
  if (!orderId) return NextResponse.json({ ok: true });

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return NextResponse.json({ ok: true });

  const mpStatus = payment.status; // approved | pending | rejected | cancelled | refunded | in_process

  await prisma.payment.updateMany({
    where: { orderId: order.id },
    data: {
      externalId: String(payment.id),
      status:
        mpStatus === "approved"
          ? "APPROVED"
          : mpStatus === "refunded"
          ? "REFUNDED"
          : mpStatus === "rejected" || mpStatus === "cancelled"
          ? "REJECTED"
          : "PENDING",
      feeAmount: toDecimal(
        (payment.fee_details ?? []).reduce((s: number, f: { amount?: number }) => s + (f.amount ?? 0), 0)
      ),
      rawPayload: JSON.stringify(payment),
    },
  });

  if (mpStatus === "approved" && order.status === "AWAITING_PAYMENT") {
    await prisma.$transaction([
      prisma.order.update({ where: { id: order.id }, data: { status: "PAID" } }),
      prisma.financialMovement.create({
        data: {
          type: "ORDER_REVENUE",
          amount: order.total,
          date: new Date(),
          description: `Pedido ${order.number}`,
          orderId: order.id,
        },
      }),
    ]);
  }

  if ((mpStatus === "rejected" || mpStatus === "cancelled") && order.status === "AWAITING_PAYMENT") {
    await prisma.$transaction([
      prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } }),
      ...order.items.map((item) =>
        prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        })
      ),
    ]);
  }

  if (mpStatus === "refunded" && order.status === "PAID") {
    await prisma.$transaction([
      prisma.order.update({ where: { id: order.id }, data: { status: "REFUNDED" } }),
      prisma.financialMovement.create({
        data: {
          type: "ORDER_REFUND",
          amount: -Number(order.total),
          date: new Date(),
          description: `Reembolso pedido ${order.number}`,
          orderId: order.id,
        },
      }),
      ...order.items.map((item) =>
        prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        })
      ),
    ]);
  }

  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const paymentId = body?.data?.id ? String(body.data.id) : req.nextUrl.searchParams.get("id");
  try {
    return await handleNotification(paymentId);
  } catch (error) {
    console.error("[mercadopago webhook]", error);
    return NextResponse.json({ ok: true });
  }
}

export async function GET(req: NextRequest) {
  const paymentId = req.nextUrl.searchParams.get("id") ?? req.nextUrl.searchParams.get("data.id");
  try {
    return await handleNotification(paymentId);
  } catch (error) {
    console.error("[mercadopago webhook]", error);
    return NextResponse.json({ ok: true });
  }
}
