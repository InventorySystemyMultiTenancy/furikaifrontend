"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Gallery({ images, name }: { images: { url: string; alt?: string | null }[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  const current = images[active];

  return (
    <div className="flex flex-col-reverse md:flex-row gap-3">
      <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              "relative w-16 h-20 flex-shrink-0 bg-furikai-gray-900 border",
              active === i ? "border-furikai-white" : "border-transparent opacity-60"
            )}
          >
            <Image src={img.url} alt={img.alt ?? name} fill className="object-cover" sizes="64px" />
          </button>
        ))}
      </div>

      <div
        className="relative flex-1 aspect-[3/4] bg-furikai-gray-900 overflow-hidden cursor-zoom-in"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setPos({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
          });
        }}
      >
        {current ? (
          <Image
            src={current.url}
            alt={current.alt ?? name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-300"
            style={{
              transform: zoom ? "scale(1.8)" : "scale(1)",
              transformOrigin: `${pos.x}% ${pos.y}%`,
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-furikai-gray-700 font-display text-3xl">
            FURIKAI
          </div>
        )}
      </div>
    </div>
  );
}
