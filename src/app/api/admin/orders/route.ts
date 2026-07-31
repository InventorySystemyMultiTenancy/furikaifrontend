import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const sp = req.nextUrl.searchParams;
  const status = sp.get("status");
  const search = sp.get("q");
  const page = Math.max(1, Number(sp.get("page") ?? 1));
  const limit = 20;

  const where: Prisma.OrderWhereInput = {};
  if (status) where.status = status as Prisma.EnumOrderStatusFilter["equals"];
  if (search) {
    where.OR = [
      { number: { contains: search, mode: "insensitive" } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { user: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { user: { select: { name: true, email: true } }, items: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({
    orders: orders.map((o) => ({
      id: o.id,
      number: o.number,
      status: o.status,
      total: Number(o.total),
      itemCount: o.items.reduce((s, i) => s + i.quantity, 0),
      customer: o.user,
      createdAt: o.createdAt.toISOString(),
    })),
    total,
    pageCount: Math.ceil(total / limit),
    page,
  });
}
