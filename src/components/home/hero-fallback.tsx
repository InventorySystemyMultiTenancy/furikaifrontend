"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

/**
 * Fallback elegante para o hero quando nenhum modelo 3D (.glb/.gltf) ou
 * imagem/vídeo de produto foi adicionado ainda em /public/assets. Mantém a
 * composição cinematográfica (flutuação + resposta ao mouse) usando apenas
 * CSS, sem quebrar a página.
 */
export function HeroFallback({ imageSrc }: { imageSrc?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function onMove(e: MouseEvent) {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2;
      const y = (e.clientY / innerHeight - 0.5) * 2;
      if (el) {
        el.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 6}deg)`;
      }
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center [perspective:1200px]">
      <div
        ref={ref}
        className="relative w-[280px] h-[340px] sm:w-[340px] sm:h-[420px] md:w-[400px] md:h-[500px] transition-transform duration-300 ease-out animate-[float_6s_ease-in-out_infinite]"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="absolute inset-0 rounded-sm overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
          {imageSrc ? (
            <Image src={imageSrc} alt="Furikai" fill className="object-contain" priority sizes="400px" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-furikai-gray-900 via-furikai-black-soft to-furikai-black flex items-center justify-center">
              <svg
                viewBox="0 0 200 240"
                className="w-3/4 h-3/4 opacity-90"
                fill="none"
                stroke="url(#metalGrad)"
                strokeWidth="1.5"
              >
                <defs>
                  <linearGradient id="metalGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#e4e4e4" />
                    <stop offset="50%" stopColor="#8a8d91" />
                    <stop offset="100%" stopColor="#3a3a3d" />
                  </linearGradient>
                </defs>
                <path d="M60 20 L20 45 L35 75 L50 65 L50 220 L150 220 L150 65 L165 75 L180 45 L140 20 L120 35 Q100 45 80 35 Z" />
              </svg>
              <p className="font-display absolute bottom-8 text-lg tracking-[0.3em] text-furikai-gray-500">
                FURIKAI
              </p>
            </div>
          )}
        </div>
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-2/3 h-6 bg-black/60 blur-2xl rounded-full" />
      </div>
      <style jsx global>{`
        @keyframes float {
          0%, 100% { translate: 0 0px; }
          50% { translate: 0 -18px; }
        }
      `}</style>
    </div>
  );
}
