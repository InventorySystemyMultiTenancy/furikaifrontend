import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serialize";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const category = sp.get("category");
  const collection = sp.get("collection");
  const search = sp.get("q");
  const sort = sp.get("sort") ?? "relevance";
  const page = Math.max(1, Number(sp.get("page") ?? 1));
  const limit = Math.min(48, Math.max(1, Number(sp.get("limit") ?? 12)));
  const featured = sp.get("featured");
  const limitedEdition = sp.get("limited");

  const where: Prisma.ProductWhereInput = { active: true };
  if (category) where.category = { slug: category };
  if (collection) where.collection = { slug: collection };
  if (featured === "true") where.featured = true;
  if (limitedEdition === "true") where.limitedEdition = true;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price-asc"
      ? { price: "asc" }
      : sort === "price-desc"
      ? { price: "desc" }
      : sort === "newest"
      ? { createdAt: "desc" }
      : { featured: "desc" };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: { images: true, variants: true, category: true, collection: true },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    items: items.map(serializeProduct),
    total,
    page,
    pageCount: Math.ceil(total / limit),
  });
}
