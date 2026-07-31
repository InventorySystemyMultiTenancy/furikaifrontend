"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Hero3D } from "./hero-3d";

export function HeroSection({
  modelAvailable,
  modelSrc,
  fallbackImageAvailable,
  fallbackImageSrc,
}: {
  modelAvailable: boolean;
  modelSrc: string;
  fallbackImageAvailable: boolean;
  fallbackImageSrc: string;
}) {
  return (
    <section className="relative w-full h-screen min-h-[640px] flex flex-col items-center justify-center overflow-hidden bg-furikai-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(156,17,25,0.12),transparent_60%)]" />

      <p className="absolute top-24 md:top-28 font-display text-sm md:text-base tracking-[0.4em] text-furikai-gray-400 z-10">
        COLEÇÃO 2026 — STREET DIVISION
      </p>

      <div className="relative z-10 w-full max-w-3xl h-[55vh] min-h-[380px]">
        <Hero3D
          modelAvailable={modelAvailable}
          modelSrc={modelSrc}
          fallbackImageAvailable={fallbackImageAvailable}
          fallbackImageSrc={fallbackImageSrc}
        />
      </div>

      <h1 className="relative z-10 font-display text-5xl md:text-8xl tracking-[0.1em] text-furikai-white -mt-6 md:-mt-10">
        FURIKAI
      </h1>
      <p className="relative z-10 text-furikai-gray-300 text-sm md:text-base tracking-wide mt-2 mb-8 text-center px-6">
        Cultura em movimento. Construído para o asfalto.
      </p>

      <Link
        href="/produtos"
        className="relative z-10 px-9 py-3 bg-furikai-white text-furikai-black text-sm uppercase tracking-wider hover:bg-furikai-red-bright hover:text-furikai-white transition-colors"
      >
        Explorar coleção
      </Link>

      <div className="absolute bottom-8 flex flex-col items-center gap-2 text-furikai-gray-400 animate-bounce">
        <span className="text-[10px] uppercase tracking-[0.3em]">Rolar</span>
        <ChevronDown size={18} />
      </div>
    </section>
  );
}
