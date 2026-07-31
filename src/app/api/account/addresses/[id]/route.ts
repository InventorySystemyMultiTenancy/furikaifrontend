import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addressSchema } from "@/lib/validations";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.address.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return NextResponse.json({ error: "Endereço não encontrado" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = addressSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } });
  }

  const address = await prisma.address.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ address });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.address.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return NextResponse.json({ error: "Endereço não encontrado" }, { status: 404 });

  await prisma.address.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
