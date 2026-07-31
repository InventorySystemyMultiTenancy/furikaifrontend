"use client";

import dynamic from "next/dynamic";
import { ThreeErrorBoundary } from "./error-boundary";
import { HeroFallback } from "./hero-fallback";

const ProductScene = dynamic(() => import("./product-scene").then((m) => m.ProductScene), {
  ssr: false,
  loading: () => <HeroFallback />,
});

export function Hero3D({
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
  if (!modelAvailable) {
    return <HeroFallback imageSrc={fallbackImageAvailable ? fallbackImageSrc : undefined} />;
  }

  return (
    <ThreeErrorBoundary
      fallback={<HeroFallback imageSrc={fallbackImageAvailable ? fallbackImageSrc : undefined} />}
    >
      <ProductScene src={modelSrc} />
    </ThreeErrorBoundary>
  );
}
