import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";
import { toDecimal } from "@/lib/pricing";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true, variants: true },
  });
  if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

  return NextResponse.json({
    product: {
      ...product,
      price: Number(product.price),
      costPrice: Number(product.costPrice),
      discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
    },
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  const data = parsed.data;

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
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
      },
    });

    // Sincroniza variantes por SKU em vez de apagar tudo e recriar: uma
    // variante já referenciada em algum pedido (OrderItem) não pode ser
    // excluída sem violar a integridade referencial do histórico de vendas.
    const existingVariants = await tx.productVariant.findMany({ where: { productId: id } });
    const incomingSkus = new Set(data.variants.map((v) => v.sku));

    for (const existing of existingVariants) {
      if (incomingSkus.has(existing.sku)) continue;
      const usedInOrders = await tx.orderItem.count({ where: { variantId: existing.id } });
      if (usedInOrders > 0) {
        // Preserva o histórico: zera o estoque em vez de excluir.
        await tx.productVariant.update({ where: { id: existing.id }, data: { stock: 0 } });
      } else {
        await tx.productVariant.delete({ where: { id: existing.id } });
      }
    }

    for (const v of data.variants) {
      const existing = existingVariants.find((e) => e.sku === v.sku);
      if (existing) {
        await tx.productVariant.update({
          where: { id: existing.id },
          data: { color: v.color, size: v.size, stock: v.stock },
        });
      } else {
        await tx.productVariant.create({
          data: { productId: id, color: v.color, size: v.size, sku: v.sku, stock: v.stock },
        });
      }
    }

    await tx.productImage.deleteMany({ where: { productId: id } });
    if (data.images && data.images.length > 0) {
      await tx.productImage.createMany({
        data: data.images.map((img, i) => ({
          productId: id,
          url: img.url,
          publicId: img.publicId,
          alt: img.alt,
          order: img.order ?? i,
        })),
      });
    }
  });

  await logAdminAction({ userId: session!.user.id, action: "UPDATE_PRODUCT", entityType: "Product", entityId: id });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  await prisma.product.update({ where: { id }, data: { active: false } });

  await logAdminAction({ userId: session!.user.id, action: "DEACTIVATE_PRODUCT", entityType: "Product", entityId: id });

  return NextResponse.json({ ok: true });
}
