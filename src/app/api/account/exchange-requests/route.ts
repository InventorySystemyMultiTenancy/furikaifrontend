import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  orderId: z.string().min(1),
  reason: z.string().min(5, "Descreva o motivo da troca."),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const order = await prisma.order.findFirst({ where: { id: parsed.data.orderId, userId: session.user.id } });
  if (!order) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  if (order.status !== "DELIVERED") {
    return NextResponse.json({ error: "Só é possível solicitar troca de pedidos entregues." }, { status: 400 });
  }

  const request = await prisma.exchangeRequest.create({
    data: { orderId: order.id, userId: session.user.id, reason: parsed.data.reason },
  });

  return NextResponse.json({ request });
}
