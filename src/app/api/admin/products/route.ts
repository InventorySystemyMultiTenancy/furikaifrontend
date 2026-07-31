import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";
import { toDecimal } from "@/lib/pricing";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const search = req.nextUrl.searchParams.get("q");
  const where: Prisma.ProductWhereInput = search
    ? { name: { contains: search, mode: "insensitive" } }
    : {};

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { images: true, variants: true, category: true, collection: true },
  });

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
      active: p.active,
      featured: p.featured,
      limitedEdition: p.limitedEdition,
      totalStock: p.variants.reduce((s, v) => s + v.stock, 0),
      category: p.category?.name ?? null,
      collection: p.collection?.name ?? null,
      image: p.images[0]?.url ?? null,
    })),
  });
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  const data = parsed.data;

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      shortDescription: data.shortDescription,
      description: data.description,
      composition: data.composition,
      sizeGuide: data.sizeGuide,
      price: toDecimal(data.price),
      costPrice: toDecimal(data.costPrice),
      discountPrice: data.discountPrice ? toDecimal(data.discountPrice) : null,
      categoryId: data.categoryId || null,
      collectionId: data.collectionId || null,
      featured: data.featured ?? false,
      limitedEdition: data.limitedEdition ?? false,
      isNew: data.isNew ?? true,
      active: data.active ?? true,
      variants: { create: data.variants.map((v) => ({ color: v.color, size: v.size, sku: v.sku, stock: v.stock })) },
      images: {
        create: (data.images ?? []).map((img, i) => ({
          url: img.url,
          publicId: img.publicId,
          alt: img.alt,
          order: img.order ?? i,
        })),
      },
    },
  });

  await logAdminAction({ userId: session!.user.id, action: "CREATE_PRODUCT", entityType: "Product", entityId: product.id });

  return NextResponse.json({ product });
}
