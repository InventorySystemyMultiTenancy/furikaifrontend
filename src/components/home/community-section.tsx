import Image from "next/image";
import Link from "next/link";
import { mediaExists } from "@/lib/media";

const GALLERY_SLOTS = [
  "/assets/images/community/01.jpg",
  "/assets/images/community/02.jpg",
  "/assets/images/community/03.jpg",
  "/assets/images/community/04.jpg",
  "/assets/images/community/05.jpg",
  "/assets/images/community/06.jpg",
];

const BENEFITS = [
  "Acesso antecipado a lançamentos e drops limitados",
  "Produtos exclusivos para membros",
  "Descontos progressivos em toda a coleção",
  "Convites para encontros e eventos Furikai",
];

export function CommunitySection() {
  return (
    <section className="py-24 px-6 lg:px-10 bg-furikai-black-soft">
      <div className="mx-auto max-w-[1800px] grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="font-display text-3xl md:text-5xl tracking-wide mb-6">
            Comunidade Furikai
          </h2>
          <p className="text-furikai-gray-300 leading-relaxed mb-8 max-w-lg">
            Mais que uma marca — um clube de quem vive a cultura automotiva japonesa. Membros
            Furikai se encontram nas madrugadas, compartilham suas builds e vestem a identidade do
            movimento.
          </p>
          <ul className="space-y-3 mb-10">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm text-furikai-gray-200">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-furikai-red-bright flex-shrink-0" />
                {b}
              </li>
            ))}
          </ul>
          <Link
            href="/comunidade"
            className="inline-block px-8 py-3 bg-furikai-red-bright text-furikai-white text-sm uppercase tracking-wider hover:bg-furikai-red transition-colors"
          >
            Entrar para o clube
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2 h-[420px] md:h-[520px]">
          {GALLERY_SLOTS.map((src, i) => {
            const exists = mediaExists(src);
            return (
              <div
                key={src}
                className={`relative overflow-hidden bg-furikai-gray-900 ${
                  i === 0 || i === 5 ? "row-span-2" : ""
                }`}
              >
                {exists ? (
                  <Image src={src} alt="" fill className="object-cover" sizes="200px" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-furikai-gray-800 via-furikai-black-soft to-furikai-black" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
