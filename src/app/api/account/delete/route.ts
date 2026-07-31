import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Exclusão de conta. Como pedidos passados precisam ser preservados para
 * fins fiscais e de histórico administrativo, a conta é anonimizada em vez
 * de removida fisicamente do banco (o que quebraria a integridade
 * referencial de Order/Payment). Isso satisfaz o pedido do usuário de não
 * ter mais seus dados pessoais nem conseguir acessar a conta.
 */
export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const anonymizedEmail = `deleted+${nanoid(10)}@furikai.local`;
  const randomPassword = await bcrypt.hash(nanoid(24), 12);

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: "Usuário removido",
      email: anonymizedEmail,
      phone: null,
      image: null,
      passwordHash: randomPassword,
      active: false,
    },
  });

  return NextResponse.json({ ok: true });
}
