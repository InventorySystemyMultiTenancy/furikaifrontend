import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const sp = req.nextUrl.searchParams;
  const search = sp.get("q");
  const page = Math.max(1, Number(sp.get("page") ?? 1));
  const limit = 20;

  const where: Prisma.UserWhereInput = search
    ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }] }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { orders: true } }, orders: { select: { total: true } } },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      blocked: u.blocked,
      active: u.active,
      orderCount: u._count.orders,
      totalSpent: u.orders.reduce((s, o) => s + Number(o.total), 0),
      createdAt: u.createdAt.toISOString(),
    })),
    total,
    pageCount: Math.ceil(total / limit),
    page,
  });
}
