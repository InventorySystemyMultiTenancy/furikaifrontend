import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/shop/product-grid";

export const metadata = { title: "Coleção" };
export const revalidate = 60;

export default async function ProdutosPage() {
  const [categories, collections] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.collection.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="pt-32 pb-24 px-6 lg:px-10">
      <div className="mx-auto max-w-[1800px]">
        <ProductGrid
          title="Coleção completa"
          categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
          collections={collections.map((c) => ({ slug: c.slug, name: c.name }))}
          pageSize={16}
        />
      </div>
    </div>
  );
}
