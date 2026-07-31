import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
  order: z.number().int().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const collection = await prisma.collection.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ collection });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const count = await prisma.product.count({ where: { collectionId: id } });
  if (count > 0) {
    return NextResponse.json(
      { error: "Existem produtos usando esta coleção. Remova-os ou reatribua antes de excluir." },
      { status: 400 }
    );
  }

  await prisma.collection.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
