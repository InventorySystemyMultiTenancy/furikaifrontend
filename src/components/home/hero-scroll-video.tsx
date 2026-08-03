"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";
import styles from "./hero-scroll-video.module.css";

// Medido nos arquivos de public/assets/videos (scroll-intro-*.mp4 têm 10.00s) —
// usado só quando video.duration vem Infinity/NaN (comum no Safari antes dos
// metadados resolverem de fato).
const FALLBACK_DURATION = 10;

function getDuration(video: HTMLVideoElement) {
  return Number.isFinite(video.duration) && video.duration > 0 ? video.duration : FALLBACK_DURATION;
}

function targetTime(progress: number, duration: number) {
  return Math.min(Math.max(progress, 0), 1) * duration;
}

export function HeroScrollVideo({
  overlay,
  children,
  desktopSrc,
  mobileSrc,
  poster,
}: {
  overlay: ReactNode;
  children: ReactNode;
  desktopSrc: string;
  mobileSrc?: string;
  poster?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  const isMobile = useIsMobile();
  const videoSrc = isMobile && mobileSrc ? mobileSrc : desktopSrc;

  useEffect(() => {
    const track = trackRef.current;
    const video = videoRef.current;
    if (!track || !video) return;

    let cancelled = false;
    let trigger: ScrollTrigger | undefined;
    let pendingProgress = 0;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function markReady() {
      if (cancelled || !video) return;

      if (reducedMotion) {
        video.currentTime = 0;
        setReady(true);
        return;
      }

      video.currentTime = targetTime(pendingProgress, getDuration(video));

      // iOS Safari (e alguns Android) não pintam nenhum frame de um <video>
      // pausado que nunca rodou — força a decodificação do frame com um
      // play/pause instantâneo antes do usuário rolar.
      const playPromise = video.play();
      if (playPromise) playPromise.then(() => video.pause()).catch(() => {});

      setReady(true);

      trigger = ScrollTrigger.create({
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        scrub: true, // sem número: acompanha o scroll 1:1, sem lag/delay
        onUpdate: (self) => {
          pendingProgress = self.progress;
          if (!video || video.seeking) return;
          video.currentTime = targetTime(self.progress, getDuration(video));
        },
      });
    }

    video.addEventListener("loadedmetadata", markReady);
    // Cobre o caso do vídeo já vir do cache do navegador — o evento
    // loadedmetadata pode nunca disparar porque já rodou antes do listener existir.
    if (video.readyState >= 1) markReady();

    return () => {
      cancelled = true;
      video.removeEventListener("loadedmetadata", markReady);
      trigger?.kill();
    };
  }, [videoSrc]);

  return (
    <div ref={trackRef} className={styles.scrollTrack}>
      <div className={styles.videoFixed}>
        <video
          key={videoSrc}
          ref={videoRef}
          src={videoSrc}
          poster={poster}
          muted
          playsInline
          preload="auto"
          className={cn(styles.video, ready && styles.ready)}
        />
        <div className={styles.scrim} />
      </div>

      <div className={styles.overlaySlot}>{overlay}</div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
