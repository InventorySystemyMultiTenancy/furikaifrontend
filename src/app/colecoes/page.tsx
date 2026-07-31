import { prisma } from "@/lib/prisma";
import { CollectionsSection } from "@/components/home/collections-section";

export const metadata = { title: "Coleções" };
export const revalidate = 60;
export const dynamic = "force-dynamic";

export default async function ColecoesPage() {
  const collections = await prisma.collection.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="pt-24">
      <CollectionsSection
        collections={collections.map((c) => ({
          slug: c.slug,
          name: c.name,
          description: c.description,
          coverImage: c.coverImage,
          productCount: c._count.products,
        }))}
      />
    </div>
  );
}
