import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serialize";
import { Gallery } from "@/components/shop/gallery";
import { ProductDetail } from "@/components/shop/product-detail";
import { Reviews } from "@/components/shop/reviews";
import { ProductGrid } from "@/components/shop/product-grid";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: true,
      variants: true,
      category: true,
      collection: true,
      reviews: {
        where: { approved: true },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
    },
  });
  return product;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return { title: product.name, description: product.shortDescription ?? undefined };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product || !product.active) notFound();

  const serialized = serializeProduct(product);

  return (
    <div className="pt-28 md:pt-32 pb-24 px-6 lg:px-10">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          <Gallery images={serialized.images} name={serialized.name} />
          <ProductDetail product={serialized} />
        </div>

        <div className="mt-20 max-w-3xl">
          <h2 className="font-display text-2xl tracking-wide mb-6">Avaliações</h2>
          <Reviews
            productId={product.id}
            reviews={product.reviews.map((r) => ({
              id: r.id,
              rating: r.rating,
              comment: r.comment,
              createdAt: r.createdAt.toISOString(),
              user: r.user,
            }))}
          />
        </div>

        <div className="mt-24">
          <ProductGrid
            title="Você também vai curtir"
            showFilters={false}
            pageSize={4}
            categorySlug={product.category?.slug}
          />
        </div>
      </div>
    </div>
  );
}
