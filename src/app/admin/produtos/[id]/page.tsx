"use client";

import { use, useEffect, useState } from "react";
import { ProductForm, type ProductFormValues } from "@/components/admin/product-form";

export default function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [initial, setInitial] = useState<Partial<ProductFormValues> | null>(null);

  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        const p = data.product;
        setInitial({
          id: p.id,
          name: p.name,
          slug: p.slug,
          shortDescription: p.shortDescription ?? "",
          description: p.description ?? "",
          composition: p.composition ?? "",
          sizeGuide: p.sizeGuide ?? "",
          price: p.price,
          costPrice: p.costPrice,
          discountPrice: p.discountPrice,
          categoryId: p.categoryId ?? "",
          collectionId: p.collectionId ?? "",
          featured: p.featured,
          limitedEdition: p.limitedEdition,
          isNew: p.isNew,
          active: p.active,
          variants: p.variants.map((v: { id: string; color: string | null; size: string; sku: string; stock: number }) => ({
            id: v.id,
            color: v.color ?? "",
            size: v.size,
            sku: v.sku,
            stock: v.stock,
          })),
          images: p.images
            .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
            .map((img: { url: string; alt: string | null }) => ({ url: img.url, alt: img.alt ?? "" })),
        });
      });
  }, [id]);

  return (
    <div>
      <h1 className="font-display text-3xl tracking-wide mb-8">Editar produto</h1>
      {initial ? <ProductForm initial={initial} /> : <p className="text-furikai-gray-400">Carregando...</p>}
    </div>
  );
}
