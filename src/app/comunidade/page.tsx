import Link from "next/link";
import { CommunitySection } from "@/components/home/community-section";

export const metadata = { title: "Comunidade" };

const EVENTS = [
  { name: "Midnight Run", desc: "Encontro mensal noturno — rota surpresa revelada na hora." },
  { name: "Track Day Furikai", desc: "Dia de pista para membros com desconto em inscrição." },
  { name: "Meet & Build", desc: "Exposição de builds da comunidade e troca de peças." },
];

export default function ComunidadePage() {
  return (
    <div className="pt-24">
      <div className="px-6 lg:px-10 pt-16 pb-8 text-center">
        <h1 className="font-display text-5xl md:text-7xl tracking-wide mb-4">Comunidade</h1>
        <p className="text-furikai-gray-300 max-w-xl mx-auto">
          Furikai é feito por quem vive a cultura automotiva japonesa todos os dias — nas garagens,
          nas madrugadas, na estrada.
        </p>
      </div>

      <CommunitySection />

      <section className="py-24 px-6 lg:px-10">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="font-display text-3xl tracking-wide mb-10 text-center">Encontros e eventos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {EVENTS.map((e) => (
              <div key={e.name} className="border border-furikai-gray-700 p-6">
                <p className="font-display text-xl tracking-wide mb-2">{e.name}</p>
                <p className="text-sm text-furikai-gray-400">{e.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-14">
            <Link
              href="/cadastro"
              className="inline-block px-10 py-4 bg-furikai-red-bright text-sm uppercase tracking-wider hover:bg-furikai-red transition-colors"
            >
              Entrar para o clube
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
