export const metadata = { title: "Manifesto" };

const PARAGRAPHS = [
  "Furikai nasceu do asfalto molhado às três da manhã, do brilho de faróis em fila, do som de um motor que ninguém mais escuta porque a cidade dorme — menos nós.",
  "Somos herdeiros de uma cultura que atravessou o oceano: a estética do carro japonês, a disciplina da engenharia, a rebeldia da pista. Não copiamos essa cultura. Nós a vivemos, todos os dias, em cada esquina onde um encontro vira lenda.",
  "Cada peça Furikai carrega essa origem. Não é streetwear genérico — é identidade. É a fumaça do escapamento traduzida em tecido, a luz de neon virando estampa, o rugido do motor virando atitude.",
  "Não é apenas um clube. É cultura em movimento. Built for the streets.",
];

export default function ManifestoPage() {
  return (
    <div className="pt-32 pb-32 px-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-5xl md:text-7xl tracking-wide mb-16 text-center">
          Manifesto
        </h1>
        <div className="space-y-8">
          {PARAGRAPHS.map((p, i) => (
            <p
              key={i}
              className={
                i === PARAGRAPHS.length - 1
                  ? "font-display text-2xl md:text-3xl tracking-wide text-center pt-8"
                  : "text-furikai-gray-300 leading-relaxed text-lg"
              }
            >
              {p}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
