"use client";

import { useSession } from "next-auth/react";
import { useFavoritesStore } from "@/store/favorites";

export function useFavoriteToggle() {
  const { data: session } = useSession();
  const toggleLocal = useFavoritesStore((s) => s.toggle);

  return function toggleFavorite(productId: string) {
    toggleLocal(productId);
    if (session?.user) {
      fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      }).catch(() => {});
    }
  };
}
