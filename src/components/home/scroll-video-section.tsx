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
    const targetTime = { value: 0 };

    function onLoaded() {
      if (!video) return;
      setReady(true);

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
        scrub: 0.6,
        onUpdate: (self) => {
          targetTime.value = self.progress * (video.duration || 0);
          setProgress(self.progress);
        },
      });

      function tick() {
        if (video && Math.abs(video.currentTime - targetTime.value) > 0.01) {
          video.currentTime += (targetTime.value - video.currentTime) * 0.35;
        }
        raf = requestAnimationFrame(tick);
      }
      raf = requestAnimationFrame(tick);
    }

    function onError() {
      setFailed(true);
    }

    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("error", onError);

    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
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
