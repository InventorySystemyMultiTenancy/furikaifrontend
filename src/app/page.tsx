import { prisma } from "@/lib/prisma";
import { mediaExists, homeMedia } from "@/lib/media";
import { HeroSection } from "@/components/home/hero-section";
import { ScrollVideoSection } from "@/components/home/scroll-video-section";
import { ProductGrid } from "@/components/shop/product-grid";
import { EditorialBanner } from "@/components/home/editorial-banner";
import { CollectionsSection } from "@/components/home/collections-section";
import { CommunitySection } from "@/components/home/community-section";
import Link from "next/link";

export const revalidate = 60;

async function getCollections() {
  const collections = await prisma.collection.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return collections.map((c) => ({
    slug: c.slug,
    name: c.name,
    description: c.description,
    coverImage: c.coverImage,
    productCount: c._count.products,
  }));
}

export default async function HomePage() {
  const collections = await getCollections();

  return (
    <>
      <HeroSection
        modelAvailable={mediaExists(homeMedia.heroModel)}
        modelSrc={homeMedia.heroModel}
        fallbackImageAvailable={mediaExists(homeMedia.heroFallbackImage)}
        fallbackImageSrc={homeMedia.heroFallbackImage}
      />

      <ScrollVideoSection
        desktopSrc={homeMedia.firstScrollVideoDesktop}
        mobileSrc={
          mediaExists(homeMedia.firstScrollVideoMobile) ? homeMedia.firstScrollVideoMobile : undefined
        }
        texts={[
          { at: 0, until: 0.22, text: "Não é apenas um clube." },
          { at: 0.3, until: 0.52, text: "É cultura em movimento." },
          { at: 0.6, until: 0.8, text: "Built for the streets." },
          { at: 0.85, until: 1, text: "FURIKAI", variant: "hero" },
        ]}
      />

      <section className="py-24 px-6 lg:px-10">
        <div className="mx-auto max-w-[1800px]">
          <ProductGrid title="Vitrine principal" showFilters={false} pageSize={8} />
          <div className="flex justify-center mt-14">
            <Link
              href="/produtos"
              className="px-8 py-3 border border-furikai-white text-sm uppercase tracking-wider hover:bg-furikai-white hover:text-furikai-black transition-colors"
            >
              Ver coleção completa
            </Link>
          </div>
        </div>
      </section>

      <EditorialBanner />

      <ScrollVideoSection
        desktopSrc={homeMedia.secondScrollVideoDesktop}
        mobileSrc={
          mediaExists(homeMedia.secondScrollVideoMobile) ? homeMedia.secondScrollVideoMobile : undefined
        }
        texts={[
          { at: 0, until: 0.25, text: "Encontros que viram lenda." },
          { at: 0.35, until: 0.6, text: "Motor, fumaça, luz." },
          { at: 0.7, until: 1, text: "Essa é a nossa pista." },
        ]}
      />

      <CollectionsSection collections={collections} />

      <CommunitySection />
    </>
  );
}
