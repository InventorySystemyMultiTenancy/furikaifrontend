"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export type ScrollVideoText = {
  /** progresso do vídeo (0 a 1) em que o texto começa a aparecer */
  at: number;
  /** progresso em que o texto termina de desaparecer */
  until: number;
  text: string;
  variant?: "hero" | "small";
};

export function ScrollVideoSection({
  desktopSrc,
  mobileSrc,
  texts = [],
  pinVh = 320,
  poster,
}: {
  desktopSrc: string;
  mobileSrc?: string;
  texts?: ScrollVideoText[];
  pinVh?: number;
  poster?: string;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [source, setSource] = useState(desktopSrc);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile && mobileSrc) setSource(mobileSrc);
  }, [mobileSrc]);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let trigger: ScrollTrigger | undefined;
    let raf = 0;
    let durationReady = false;
    const targetTime = { value: 0 };

    function markReady() {
      if (!video || durationReady) return;
      durationReady = Number.isFinite(video.duration) && video.duration > 0;
      if (!durationReady) return;
      setReady(true);

      // Safari iOS não pinta nenhum frame de um <video> pausado que nunca
      // rodou, mesmo setando currentTime manualmente — força a decodificação
      // de um frame com um play/pause instantâneo antes do usuário rolar.
      const playPromise = video.play();
      if (playPromise) playPromise.then(() => video.pause()).catch(() => {});

      if (reducedMotion) {
        // Sem scroll-scrubbing: apenas reproduz o vídeo normalmente.
        video.muted = true;
        video.loop = true;
        video.play().catch(() => {});
        return;
      }

      trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: `+=${pinVh}%`,
        pin: true,
        // scrub: true (sem número) segue o scroll quase 1:1 — um valor
        // numérico alto (ex.: 0.6) soma um atraso perceptível de "catch-up"
        // que fazia o vídeo parecer descolado do scroll real do usuário.
        scrub: true,
        onUpdate: (self) => {
          targetTime.value = Math.min(self.progress * video.duration, video.duration - 0.05);
          setProgress(self.progress);
        },
      });

      function tick() {
        if (video && durationReady && Math.abs(video.currentTime - targetTime.value) > 0.005) {
          video.currentTime += (targetTime.value - video.currentTime) * 0.5;
        }
        raf = requestAnimationFrame(tick);
      }
      raf = requestAnimationFrame(tick);
    }

    function onError() {
      setFailed(true);
    }

    video.addEventListener("loadedmetadata", markReady);
    video.addEventListener("error", onError);
    // Fallback pra vídeo já em cache (voltar pra página, bfcache do Safari):
    // o evento loadedmetadata pode já ter disparado antes do listener existir.
    if (video.readyState >= 1) markReady();

    return () => {
      video.removeEventListener("loadedmetadata", markReady);
      video.removeEventListener("error", onError);
      trigger?.kill();
      cancelAnimationFrame(raf);
    };
  }, [source, pinVh]);

  if (failed) {
    return null;
  }

  return (
    <section ref={sectionRef} className="relative w-full h-screen overflow-hidden bg-furikai-black">
      <video
        key={source}
        ref={videoRef}
        src={source}
        poster={poster}
        muted
        playsInline
        preload="auto"
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-opacity duration-700",
          ready ? "opacity-100" : "opacity-0"
        )}
      />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-furikai-black">
          <div className="w-8 h-8 border-2 border-furikai-gray-700 border-t-furikai-white rounded-full animate-spin" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/60" />

      <div className="absolute inset-0 flex items-center justify-center px-6">
        {texts.map((t, i) => {
          const visible = progress >= t.at && progress <= t.until;
          return (
            <p
              key={i}
              className={cn(
                "absolute font-display tracking-wide text-center transition-all duration-700 ease-out",
                t.variant === "small" ? "text-2xl md:text-4xl" : "text-4xl md:text-7xl",
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              )}
            >
              {t.text}
            </p>
          );
        })}
      </div>
    </section>
  );
}
