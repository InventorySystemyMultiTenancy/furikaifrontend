"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useFavoritesStore } from "@/store/favorites";

/**
 * Ao logar, busca os favoritos salvos no servidor e mescla com os
 * favoritos locais (guest) para manter a lista consistente entre
 * dispositivos.
 */
export function FavoritesSync() {
  const { data: session, status } = useSession();
  const setAll = useFavoritesStore((s) => s.setAll);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data) => {
        const serverIds: string[] = (data.favorites ?? []).map((p: { id: string }) => p.id);
        setAll(serverIds);
      })
      .catch(() => {});
  }, [status, session, setAll]);

  return null;
}
