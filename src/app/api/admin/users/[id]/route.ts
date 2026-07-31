import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: { orders: { orderBy: { createdAt: "desc" } }, addresses: true },
  });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      blocked: user.blocked,
      active: user.active,
      createdAt: user.createdAt.toISOString(),
      totalSpent: user.orders.reduce((s, o) => s + Number(o.total), 0),
      orders: user.orders.map((o) => ({
        id: o.id,
        number: o.number,
        status: o.status,
        total: Number(o.total),
        createdAt: o.createdAt.toISOString(),
      })),
      addresses: user.addresses,
    },
  });
}

const patchSchema = z.object({
  role: z.enum(["CUSTOMER", "STAFF", "ADMIN"]).optional(),
  blocked: z.boolean().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  if (session!.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Apenas administradores podem alterar usuários." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const user = await prisma.user.update({ where: { id }, data: parsed.data });

  await logAdminAction({
    userId: session!.user.id,
    action: "UPDATE_USER",
    entityType: "User",
    entityId: id,
    details: parsed.data,
  });

  return NextResponse.json({ user });
}
