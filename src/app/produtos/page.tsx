import { backendFetch } from "@/lib/backend-client";
import { ProductGrid } from "@/components/shop/product-grid";

export const metadata = { title: "Coleção" };
export const revalidate = 60;
export const dynamic = "force-dynamic";

export default async function ProdutosPage() {
  const [{ body: categoriesBody }, { body: collectionsBody }] = await Promise.all([
    backendFetch<{ categories: { slug: string; name: string }[] }>("/api/categories"),
    backendFetch<{ collections: { slug: string; name: string }[] }>("/api/collections"),
  ]);

  return (
    <div className="pt-32 pb-24 px-6 lg:px-10">
      <div className="mx-auto max-w-[1800px]">
        <ProductGrid
          title="Coleção completa"
          categories={categoriesBody.categories ?? []}
          collections={collectionsBody.collections ?? []}
          pageSize={16}
        />
      </div>
    </div>
  );
}
