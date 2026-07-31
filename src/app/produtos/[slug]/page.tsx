import { notFound } from "next/navigation";
import { backendFetch } from "@/lib/backend-client";
import type { SerializedProduct } from "@/lib/serialize";
import { Gallery } from "@/components/shop/gallery";
import { ProductDetail } from "@/components/shop/product-detail";
import { Reviews } from "@/components/shop/reviews";
import { ProductGrid } from "@/components/shop/product-grid";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type ProductReview = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string };
};

async function getProduct(slug: string) {
  const { ok, status, body } = await backendFetch<{
    product: SerializedProduct;
    productId: string;
    reviews: ProductReview[];
  }>(`/api/products/${slug}`);

  if (!ok) {
    if (status === 404) return null;
    throw new Error(`Falha ao carregar produto: ${status}`);
  }
  return body;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data) return {};
  return { title: data.product.name, description: data.product.shortDescription ?? undefined };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data || !data.product.active) notFound();

  const serialized = data.product;

  return (
    <div className="pt-28 md:pt-32 pb-24 px-6 lg:px-10">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          <Gallery images={serialized.images} name={serialized.name} />
          <ProductDetail product={serialized} />
        </div>

        <div className="mt-20 max-w-3xl">
          <h2 className="font-display text-2xl tracking-wide mb-6">Avaliações</h2>
          <Reviews productId={data.productId} reviews={data.reviews} />
        </div>

        <div className="mt-24">
          <ProductGrid
            title="Você também vai curtir"
            showFilters={false}
            pageSize={4}
            categorySlug={serialized.category?.slug}
          />
        </div>
      </div>
    </div>
  );
}
