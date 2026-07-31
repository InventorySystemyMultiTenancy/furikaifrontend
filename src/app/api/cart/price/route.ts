import { NextRequest, NextResponse } from "next/server";
import { priceCart } from "@/lib/pricing";
import { z } from "zod";

const schema = z.object({
  items: z.array(z.object({ variantId: z.string(), quantity: z.number().int().min(1) })),
  couponCode: z.string().optional().nullable(),
  shippingCost: z.number().min(0).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  }

  const result = await priceCart(parsed.data);
  return NextResponse.json(result);
}
