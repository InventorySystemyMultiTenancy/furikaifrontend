"use client";

import { useRef, useState } from "react";

export type MediaItem = {
  id: string;
  url: string;
  publicId: string;
  type: "IMAGE" | "VIDEO" | "MODEL_3D";
  tag: string | null;
  originalName: string | null;
};

function resourceTypeFor(file: File): "IMAGE" | "VIDEO" | "MODEL_3D" {
  if (file.type.startsWith("video/")) return "VIDEO";
  if (file.name.endsWith(".glb") || file.name.endsWith(".gltf")) return "MODEL_3D";
  return "IMAGE";
}

export function MediaUploader({ onUploaded }: { onUploaded: (item: MediaItem) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  async function handleFiles(files: FileList) {
    setError("");
    for (const file of Array.from(files)) {
      await uploadOne(file);
    }
  }

  async function uploadOne(file: File) {
    setUploading(true);
    setProgress(0);
    try {
      const signRes = await fetch("/api/admin/media/sign", { method: "POST" });
      const signData = await signRes.json();
      if (!signRes.ok) throw new Error(signData.error);

      const type = resourceTypeFor(file);
      const cloudinaryResourceType = type === "VIDEO" ? "video" : type === "MODEL_3D" ? "raw" : "image";

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signData.apiKey);
      formData.append("timestamp", String(signData.timestamp));
      formData.append("signature", signData.signature);
      formData.append("folder", signData.folder);

      const uploadResult: { secure_url: string; public_id: string } = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(
          "POST",
          `https://api.cloudinary.com/v1_1/${signData.cloudName}/${cloudinaryResourceType}/upload`
        );
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
          else reject(new Error("Falha no upload para o Cloudinary"));
        };
        xhr.onerror = () => reject(new Error("Falha no upload para o Cloudinary"));
        xhr.send(formData);
      });

      const saveRes = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          type,
          originalName: file.name,
        }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.error);
      onUploaded(saveData.media);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro no upload.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  return (
    <div className="border-2 border-dashed border-furikai-gray-700 p-8 text-center">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*,.glb,.gltf"
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      <p className="text-sm text-furikai-gray-400 mb-4">
        Envie imagens, vídeos ou modelos 3D (.glb/.gltf) diretamente para o Cloudinary.
      </p>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="px-6 py-3 bg-furikai-white text-furikai-black text-sm uppercase tracking-wide hover:bg-furikai-red-bright hover:text-furikai-white transition-colors disabled:opacity-50"
      >
        {uploading ? `Enviando... ${progress}%` : "Selecionar arquivos"}
      </button>
      {error && <p className="text-xs text-furikai-red-bright mt-3">{error}</p>}
    </div>
  );
}
