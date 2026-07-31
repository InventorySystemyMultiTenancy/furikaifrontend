import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const number = req.nextUrl.searchParams.get("number")?.trim();
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();

  if (!number || !email) {
    return NextResponse.json({ error: "Informe o número do pedido e o e-mail." }, { status: 400 });
  }

  const rl = checkRateLimit(`track:${email}`, 15, 5 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um instante." }, { status: 429 });
  }

  const order = await prisma.order.findFirst({
    where: { number, user: { email } },
  });

  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado para este e-mail." }, { status: 404 });
  }

  return NextResponse.json({
    order: {
      number: order.number,
      status: order.status,
      trackingCode: order.trackingCode,
      carrier: order.carrier,
      createdAt: order.createdAt.toISOString(),
    },
  });
}
