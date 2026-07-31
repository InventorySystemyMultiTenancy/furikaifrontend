import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { slugify } from "@/lib/utils";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const collections = await prisma.collection.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json({ collections });
}

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
  order: z.number().int().optional(),
});

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const collection = await prisma.collection.create({
    data: { ...parsed.data, slug: slugify(parsed.data.name) },
  });
  return NextResponse.json({ collection });
}
