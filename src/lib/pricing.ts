import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type PricedLine = {
  productId: string;
  variantId: string;
  productName: string;
  variantLabel: string;
  unitPrice: number;
  unitCost: number;
  quantity: number;
  lineTotal: number;
  availableStock: number;
};

export type PricingResult = {
  lines: PricedLine[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  couponId: string | null;
  errors: string[];
};

/**
 * Fonte única de verdade para preços. NUNCA confiar em valores vindos do
 * cliente (carrinho no localStorage, formulário de checkout etc.) — todo
 * preço, desconto e frete é recalculado aqui a partir do banco antes de
 * criar o pedido ou confirmar o pagamento.
 */
export async function priceCart(params: {
  items: { variantId: string; quantity: number }[];
  couponCode?: string | null;
  shippingCost?: number;
}): Promise<PricingResult> {
  const errors: string[] = [];
  const variantIds = params.items.map((i) => i.variantId);

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });

  const lines: PricedLine[] = [];

  for (const item of params.items) {
    const variant = variants.find((v) => v.id === item.variantId);
    if (!variant || !variant.product.active) {
      errors.push(`Produto indisponível (${item.variantId}).`);
      continue;
    }
    if (item.quantity < 1) continue;

    if (variant.stock < item.quantity) {
      errors.push(`Estoque insuficiente para ${variant.product.name} (${variant.size}).`);
    }

    const unitPrice = Number(variant.product.discountPrice ?? variant.product.price);
    const unitCost = Number(variant.product.costPrice);
    const quantity = Math.min(item.quantity, Math.max(variant.stock, 0));

    lines.push({
      productId: variant.productId,
      variantId: variant.id,
      productName: variant.product.name,
      variantLabel: [variant.color, variant.size].filter(Boolean).join(" / "),
      unitPrice,
      unitCost,
      quantity: item.quantity,
      lineTotal: Math.round(unitPrice * item.quantity * 100) / 100,
      availableStock: variant.stock,
    });
  }

  const subtotal = Math.round(lines.reduce((sum, l) => sum + l.lineTotal, 0) * 100) / 100;

  let discount = 0;
  let couponId: string | null = null;

  if (params.couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: params.couponCode.toUpperCase() } });
    if (!coupon || !coupon.active) {
      errors.push("Cupom inválido ou expirado.");
    } else if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      errors.push("Cupom expirado.");
    } else if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      errors.push("Cupom esgotado.");
    } else if (coupon.minOrderValue && subtotal < Number(coupon.minOrderValue)) {
      errors.push(`Pedido mínimo de ${coupon.minOrderValue} para usar este cupom.`);
    } else {
      couponId = coupon.id;
      discount =
        coupon.type === "PERCENT"
          ? (subtotal * Number(coupon.value)) / 100
          : Math.min(Number(coupon.value), subtotal);
      discount = Math.round(discount * 100) / 100;
    }
  }

  const shippingCost = Math.max(0, params.shippingCost ?? 0);
  const total = Math.round((subtotal - discount + shippingCost) * 100) / 100;

  return { lines, subtotal, discount, shippingCost, total, couponId, errors };
}

export function toDecimal(value: number) {
  return new Prisma.Decimal(value.toFixed(2));
}
