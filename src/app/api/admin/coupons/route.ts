import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { couponSchema } from "@/lib/validations";
import { toDecimal } from "@/lib/pricing";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({
    coupons: coupons.map((c) => ({
      ...c,
      value: Number(c.value),
      minOrderValue: c.minOrderValue ? Number(c.minOrderValue) : null,
    })),
  });
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = couponSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const coupon = await prisma.coupon.create({
    data: {
      code: parsed.data.code.toUpperCase(),
      type: parsed.data.type,
      value: toDecimal(parsed.data.value),
      minOrderValue: parsed.data.minOrderValue ? toDecimal(parsed.data.minOrderValue) : null,
      maxUses: parsed.data.maxUses,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      active: parsed.data.active ?? true,
    },
  });
  return NextResponse.json({ coupon });
}
