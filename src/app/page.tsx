import { backendFetch } from "@/lib/backend-client";
import { mediaExists, homeMedia } from "@/lib/media";
import { HeroScrollVideo } from "@/components/home/hero-scroll-video-loader";
import { ProductGrid } from "@/components/shop/product-grid";
import { EditorialBanner } from "@/components/home/editorial-banner";
import { CollectionsSection } from "@/components/home/collections-section";
import { CommunitySection } from "@/components/home/community-section";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export const revalidate = 60;
export const dynamic = "force-dynamic";

type CollectionSummary = {
  slug: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  productCount: number;
};

async function getCollections() {
  const { body } = await backendFetch<{ collections: CollectionSummary[] }>("/api/collections");
  return body.collections ?? [];
}

export default async function HomePage() {
  const collections = await getCollections();

  return (
    <HeroScrollVideo
      desktopSrc={homeMedia.firstScrollVideoDesktop}
      mobileSrc={
        mediaExists(homeMedia.firstScrollVideoMobile) ? homeMedia.firstScrollVideoMobile : undefined
      }
      overlay={
        <div className="relative h-full min-h-screen flex flex-col items-center justify-center px-6">
          <p className="absolute top-24 md:top-28 font-display text-sm md:text-base tracking-[0.4em] text-furikai-gray-400">
            COLEÇÃO 2026 — STREET DIVISION
          </p>

          <h1 className="font-display text-5xl md:text-8xl tracking-[0.1em] text-furikai-white">
            FURIKAI
          </h1>
          <p className="text-furikai-gray-300 text-sm md:text-base tracking-wide mt-2 mb-8 text-center">
            Cultura em movimento. Construído para o asfalto.
          </p>

          <Link
            href="/produtos"
            className="px-9 py-3 bg-furikai-white text-furikai-black text-sm uppercase tracking-wider hover:bg-furikai-red-bright hover:text-furikai-white transition-colors"
          >
            Explorar coleção
          </Link>

          <div className="absolute bottom-8 flex flex-col items-center gap-2 text-furikai-gray-400 animate-bounce">
            <span className="text-[10px] uppercase tracking-[0.3em]">Rolar</span>
            <ChevronDown size={18} />
          </div>
        </div>
      }
    >
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

      <CollectionsSection collections={collections} />

      <CommunitySection />
    </HeroScrollVideo>
  );
}
