import Image from "next/image";
import Link from "next/link";
import { mediaExists, homeMedia } from "@/lib/media";

export function EditorialBanner() {
  const hasVideo = mediaExists(homeMedia.editorialBannerVideo);
  const hasImage = mediaExists(homeMedia.editorialBannerImage);

  return (
    <section className="relative w-full h-[70vh] min-h-[420px] overflow-hidden flex items-center justify-center">
      {hasVideo ? (
        <video
          src={homeMedia.editorialBannerVideo}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : hasImage ? (
        <Image
          src={homeMedia.editorialBannerImage}
          alt="Furikai"
          fill
          className="object-cover"
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-furikai-gray-900 via-furikai-black to-furikai-red/20" />
      )}
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative z-10 text-center px-6 max-w-3xl">
        <p className="font-display text-3xl md:text-6xl leading-tight tracking-wide text-furikai-white">
          Driven by machines.
          <br />
          United by culture.
        </p>
        <Link
          href="/comunidade"
          className="inline-block mt-8 px-8 py-3 border border-furikai-white text-furikai-white text-sm uppercase tracking-wider hover:bg-furikai-white hover:text-furikai-black transition-colors"
        >
          Conheça a história do clube
        </Link>
      </div>
    </section>
  );
}
