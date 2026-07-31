import type { Product, ProductImage, ProductVariant, Category, Collection } from "@prisma/client";

export type ProductWithRelations = Product & {
  images: ProductImage[];
  variants: ProductVariant[];
  category?: Category | null;
  collection?: Collection | null;
};

export function serializeProduct(p: ProductWithRelations) {
  const price = Number(p.price);
  const discountPrice = p.discountPrice ? Number(p.discountPrice) : null;
  const finalPrice = discountPrice ?? price;
  const discountPercent = discountPrice
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;
  const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
  const sizes = Array.from(new Set(p.variants.map((v) => v.size)));

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    shortDescription: p.shortDescription,
    description: p.description,
    composition: p.composition,
    sizeGuide: p.sizeGuide,
    price,
    discountPrice,
    finalPrice,
    discountPercent,
    featured: p.featured,
    limitedEdition: p.limitedEdition,
    isNew: p.isNew,
    active: p.active,
    inStock: totalStock > 0,
    totalStock,
    sizes,
    category: p.category ? { id: p.category.id, name: p.category.name, slug: p.category.slug } : null,
    collection: p.collection
      ? { id: p.collection.id, name: p.collection.name, slug: p.collection.slug }
      : null,
    images: p.images
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((img) => ({ url: img.url, alt: img.alt })),
    variants: p.variants.map((v) => ({
      id: v.id,
      color: v.color,
      size: v.size,
      stock: v.stock,
      sku: v.sku,
    })),
    createdAt: p.createdAt.toISOString(),
  };
}

export type SerializedProduct = ReturnType<typeof serializeProduct>;
