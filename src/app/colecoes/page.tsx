import { backendFetch } from "@/lib/backend-client";
import { CollectionsSection } from "@/components/home/collections-section";

export const metadata = { title: "Coleções" };
export const revalidate = 60;
export const dynamic = "force-dynamic";

type CollectionSummary = {
  slug: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  productCount: number;
};

export default async function ColecoesPage() {
  const { body } = await backendFetch<{ collections: CollectionSummary[] }>("/api/collections");

  return (
    <div className="pt-24">
      <CollectionsSection collections={body.collections ?? []} />
    </div>
  );
}
