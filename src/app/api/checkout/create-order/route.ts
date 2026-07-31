import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { priceCart, toDecimal } from "@/lib/pricing";
import { calculateShipping, DEFAULT_ITEM_WEIGHT_KG } from "@/lib/shipping";
import { checkoutSchema } from "@/lib/validations";
import { generateOrderNumber } from "@/lib/utils";
import { createCheckoutPreference, isMercadoPagoConfigured } from "@/lib/mercadopago";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Faça login para finalizar a compra." }, { status: 401 });
  }

  const rl = checkRateLimit(`checkout:${session.user.id}`, 12, 5 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um instante." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 });
  }

  const { items, addressId, shippingService, couponCode } = parsed.data;

  const address = await prisma.address.findFirst({ where: { id: addressId, userId: session.user.id } });
  if (!address) {
    return NextResponse.json({ error: "Endereço não encontrado." }, { status: 400 });
  }

  const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);
  let shippingCost = 0;
  try {
    const quotes = calculateShipping(address.zip, totalQuantity * DEFAULT_ITEM_WEIGHT_KG);
    const quote = quotes.find((q) => q.service === shippingService);
    if (!quote) throw new Error("Serviço de frete inválido");
    shippingCost = quote.price;
  } catch {
    return NextResponse.json({ error: "Não foi possível calcular o frete." }, { status: 400 });
  }

  const priced = await priceCart({ items, couponCode, shippingCost });
  if (priced.errors.length > 0) {
    return NextResponse.json({ error: priced.errors[0] }, { status: 400 });
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      for (const line of priced.lines) {
        const updated = await tx.productVariant.updateMany({
          where: { id: line.variantId, stock: { gte: line.quantity } },
          data: { stock: { decrement: line.quantity } },
        });
        if (updated.count === 0) {
          throw new Error(`Estoque insuficiente para ${line.productName}.`);
        }
      }

      const created = await tx.order.create({
        data: {
          number: generateOrderNumber(),
          userId: session.user.id,
          addressId: address.id,
          status: "AWAITING_PAYMENT",
          subtotal: toDecimal(priced.subtotal),
          discount: toDecimal(priced.discount),
          shippingCost: toDecimal(shippingCost),
          total: toDecimal(priced.total),
          couponId: priced.couponId,
          paymentMethod: parsed.data.paymentMethod,
          items: {
            create: priced.lines.map((l) => ({
              productId: l.productId,
              variantId: l.variantId,
              productName: l.productName,
              variantLabel: l.variantLabel,
              unitPrice: toDecimal(l.unitPrice),
              unitCost: toDecimal(l.unitCost),
              quantity: l.quantity,
            })),
          },
          payments: {
            create: {
              provider: "mercadopago",
              method: parsed.data.paymentMethod,
              status: "PENDING",
              amount: toDecimal(priced.total),
            },
          },
        },
      });

      if (priced.couponId) {
        await tx.coupon.update({ where: { id: priced.couponId }, data: { usedCount: { increment: 1 } } });
      }

      return created;
    });

    if (!isMercadoPagoConfigured()) {
      return NextResponse.json({
        orderId: order.id,
        orderNumber: order.number,
        redirectUrl: `/checkout/pendente?order=${order.id}&demo=1`,
      });
    }

    const preference = await createCheckoutPreference({
      orderId: order.id,
      orderNumber: order.number,
      items: priced.lines.map((l) => ({
        id: l.variantId,
        title: `${l.productName} (${l.variantLabel})`,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
      })),
      shippingCost,
      discount: priced.discount,
      payerEmail: session.user.email ?? "",
      payerName: session.user.name ?? "",
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.number,
      redirectUrl: preference.init_point,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao criar pedido." },
      { status: 400 }
    );
  }
}
