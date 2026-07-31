import { notFound } from "next/navigation";
import Image from "next/image";
import { backendFetch } from "@/lib/backend-client";
import { ProductGrid } from "@/components/shop/product-grid";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type CollectionSummary = {
  slug: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  productCount: number;
};

async function getCollection(slug: string) {
  const { ok, status, body } = await backendFetch<{ collection: CollectionSummary }>(
    `/api/collections/${slug}`
  );
  if (!ok) {
    if (status === 404) return null;
    throw new Error(`Falha ao carregar coleção: ${status}`);
  }
  return body.collection;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollection(slug);
  return { title: collection?.name ?? "Coleção" };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = await getCollection(slug);
  if (!collection) notFound();

  return (
    <div>
      <div className="relative h-[45vh] min-h-[320px] flex items-end overflow-hidden">
        {collection.coverImage ? (
          <Image src={collection.coverImage} alt={collection.name} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-furikai-gray-900 to-furikai-black" />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 p-8">
          <h1 className="font-display text-5xl tracking-wide">{collection.name}</h1>
          {collection.description && (
            <p className="text-furikai-gray-300 max-w-xl mt-2">{collection.description}</p>
          )}
          <p className="text-xs uppercase tracking-wider text-furikai-gray-500 mt-2">
            {collection.productCount} peças
          </p>
        </div>
      </div>

      <div className="px-6 lg:px-10 py-16">
        <div className="mx-auto max-w-[1800px]">
          <ProductGrid collectionSlug={collection.slug} showFilters={false} pageSize={16} />
        </div>
      </div>
    </div>
  );
}
