"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { MediaUploader, type MediaItem } from "@/components/admin/media-uploader";

export default function AdminMidiaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function load() {
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((data) => setMedia(data.media ?? []));
  }

  useEffect(load, []);

  async function remove(id: string) {
    await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
    load();
  }

  function copy(url: string, id: string) {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-wide mb-2">Mídia</h1>
        <p className="text-sm text-furikai-gray-400 max-w-2xl">
          Enquanto as fotos oficiais das peças não estão prontas, use esta aba para subir imagens,
          vídeos e modelos 3D no Cloudinary. Copie a URL gerada e cole no campo de imagens ao
          cadastrar ou editar um produto em <span className="text-furikai-white">Admin → Produtos</span>.
        </p>
      </div>

      <MediaUploader onUploaded={(item) => setMedia((prev) => [item, ...prev])} />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {media.map((m) => (
          <div key={m.id} className="border border-furikai-gray-700 p-2 space-y-2">
            <div className="relative aspect-square bg-furikai-gray-900 overflow-hidden">
              {m.type === "IMAGE" && <Image src={m.url} alt={m.originalName ?? ""} fill className="object-cover" />}
              {m.type === "VIDEO" && <video src={m.url} className="w-full h-full object-cover" muted />}
              {m.type === "MODEL_3D" && (
                <div className="w-full h-full flex items-center justify-center text-xs text-furikai-gray-500">
                  Modelo 3D
                </div>
              )}
            </div>
            <p className="text-[11px] text-furikai-gray-500 truncate">{m.originalName}</p>
            <div className="flex gap-2">
              <button
                onClick={() => copy(m.url, m.id)}
                className="flex-1 text-[11px] uppercase border border-furikai-gray-700 py-1 hover:border-furikai-white"
              >
                {copiedId === m.id ? "Copiado!" : "Copiar URL"}
              </button>
              <button
                onClick={() => remove(m.id)}
                className="text-[11px] uppercase border border-furikai-gray-700 px-2 py-1 hover:border-furikai-red-bright hover:text-furikai-red-bright"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
      {media.length === 0 && <p className="text-sm text-furikai-gray-500">Nenhum arquivo enviado ainda.</p>}
    </div>
  );
}
