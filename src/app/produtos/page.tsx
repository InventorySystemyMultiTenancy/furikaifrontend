import { backendFetch } from "@/lib/backend-client";
import { mediaExists, homeMedia } from "@/lib/media";
import { HeroScrollVideo } from "@/components/home/hero-scroll-video-loader";
import { ProductGrid } from "@/components/shop/product-grid";
import { ChevronDown } from "lucide-react";

export const metadata = { title: "Coleção" };
export const revalidate = 60;
export const dynamic = "force-dynamic";

export default async function ProdutosPage() {
  const [{ body: categoriesBody }, { body: collectionsBody }] = await Promise.all([
    backendFetch<{ categories: { slug: string; name: string }[] }>("/api/categories"),
    backendFetch<{ collections: { slug: string; name: string }[] }>("/api/collections"),
  ]);

  return (
    <HeroScrollVideo
      desktopSrc={homeMedia.firstScrollVideoDesktop}
      mobileSrc={
        mediaExists(homeMedia.firstScrollVideoMobile) ? homeMedia.firstScrollVideoMobile : undefined
      }
      overlay={
        <div className="relative h-full min-h-screen flex flex-col items-center justify-center px-6">
          <p className="font-display text-sm md:text-base tracking-[0.4em] text-furikai-gray-400">
            STREET DIVISION
          </p>
          <h1 className="font-display text-5xl md:text-8xl tracking-[0.1em] text-furikai-white mt-2">
            COLEÇÃO
          </h1>
          <p className="text-furikai-gray-300 text-sm md:text-base tracking-wide mt-2 text-center">
            Cada peça, uma pista.
          </p>

          <div className="absolute bottom-8 flex flex-col items-center gap-2 text-furikai-gray-400 animate-bounce">
            <span className="text-[10px] uppercase tracking-[0.3em]">Rolar</span>
            <ChevronDown size={18} />
          </div>
        </div>
      }
    >
      <div className="pt-24 pb-24 px-6 lg:px-10">
        <div className="mx-auto max-w-[1800px]">
          <ProductGrid
            title="Coleção completa"
            categories={categoriesBody.categories ?? []}
            collections={collectionsBody.collections ?? []}
            pageSize={16}
          />
        </div>
      </div>
    </HeroScrollVideo>
  );
}
