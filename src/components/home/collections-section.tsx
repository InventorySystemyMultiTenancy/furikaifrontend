import Image from "next/image";
import Link from "next/link";

export type CollectionSummary = {
  slug: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  productCount: number;
};

export function CollectionsSection({ collections }: { collections: CollectionSummary[] }) {
  if (collections.length === 0) return null;

  return (
    <section className="py-24 px-6 lg:px-10">
      <div className="mx-auto max-w-[1800px]">
        <h2 className="font-display text-3xl md:text-5xl tracking-wide mb-12">Coleções</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((c) => (
            <Link
              key={c.slug}
              href={`/colecoes/${c.slug}`}
              className="group relative aspect-[4/5] overflow-hidden bg-furikai-gray-900 block"
            >
              {c.coverImage ? (
                <Image
                  src={c.coverImage}
                  alt={c.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-furikai-gray-800 to-furikai-black transition-transform duration-700 group-hover:scale-110" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10 group-hover:from-black/95 transition-colors duration-500" />
              <div className="absolute inset-0 p-6 flex flex-col justify-end translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <p className="font-display text-2xl tracking-wide text-furikai-white">{c.name}</p>
                {c.description && (
                  <p className="text-sm text-furikai-gray-300 mt-1 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {c.description}
                  </p>
                )}
                <p className="text-xs text-furikai-gray-400 mt-2 uppercase tracking-wider">
                  {c.productCount} peças
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
