"use client";

import dynamic from "next/dynamic";

export const HeroScrollVideo = dynamic(
  () => import("./hero-scroll-video").then((m) => m.HeroScrollVideo),
  { ssr: false }
);
