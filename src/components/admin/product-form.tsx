"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";

type Variant = { id?: string; color: string; size: string; sku: string; stock: number };
type ImageRow = { url: string; alt: string };

export type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  composition: string;
  sizeGuide: string;
  price: number;
  costPrice: number;
  discountPrice: number | null;
  categoryId: string;
  collectionId: string;
  featured: boolean;
  limitedEdition: boolean;
  isNew: boolean;
  active: boolean;
  variants: Variant[];
  images: ImageRow[];
};

const EMPTY: ProductFormValues = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  composition: "",
  sizeGuide: "",
  price: 0,
  costPrice: 0,
  discountPrice: null,
  categoryId: "",
  collectionId: "",
  featured: false,
  limitedEdition: false,
  isNew: true,
  active: true,
  variants: [{ color: "", size: "P", sku: "", stock: 0 }],
  images: [],
};

const inputClass =
  "w-full bg-transparent border border-furikai-gray-700 px-3 py-2 text-sm focus:outline-none focus:border-furikai-white";

export function ProductForm({ initial }: { initial?: Partial<ProductFormValues> }) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>({ ...EMPTY, ...initial });
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [collections, setCollections] = useState<{ id: string; name: string }[]>([]);
  const [mediaImages, setMediaImages] = useState<{ url: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/categories").then((r) => r.json()).then((d) => setCategories(d.categories ?? []));
    fetch("/api/admin/collections").then((r) => r.json()).then((d) => setCollections(d.collections ?? []));
    fetch("/api/admin/media").then((r) => r.json()).then((d) =>
      setMediaImages((d.media ?? []).filter((m: { type: string }) => m.type === "IMAGE"))
    );
  }, []);

  function set<K extends keyof ProductFormValues>(key: K, val: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  function updateVariant(i: number, patch: Partial<Variant>) {
    setValues((v) => ({ ...v, variants: v.variants.map((x, idx) => (idx === i ? { ...x, ...patch } : x)) }));
  }

  function addVariant() {
    setValues((v) => ({ ...v, variants: [...v.variants, { color: "", size: "", sku: "", stock: 0 }] }));
  }

  function removeVariant(i: number) {
    setValues((v) => ({ ...v, variants: v.variants.filter((_, idx) => idx !== i) }));
  }

  function addImage(url: string) {
    if (!url) return;
    setValues((v) => ({ ...v, images: [...v.images, { url, alt: v.name }] }));
  }

  function removeImage(i: number) {
    setValues((v) => ({ ...v, images: v.images.filter((_, idx) => idx !== i) }));
  }

  async function submit() {
    setSaving(true);
    setError("");
    const payload = {
      ...values,
      categoryId: values.categoryId || null,
      collectionId: values.collectionId || null,
      discountPrice: values.discountPrice || null,
      images: values.images.map((img, i) => ({ url: img.url, alt: img.alt, order: i })),
    };

    try {
      const res = await fetch(values.id ? `/api/admin/products/${values.id}` : "/api/admin/products", {
        method: values.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/admin/produtos");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar produto.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          placeholder="Nome do produto"
          value={values.name}
          onChange={(e) => {
            set("name", e.target.value);
            if (!values.id) set("slug", slugify(e.target.value));
          }}
          className={inputClass}
        />
        <input
          placeholder="slug-do-produto"
          value={values.slug}
          onChange={(e) => set("slug", e.target.value)}
          className={inputClass}
        />
      </div>

      <textarea
        placeholder="Descrição curta"
        value={values.shortDescription}
        onChange={(e) => set("shortDescription", e.target.value)}
        rows={2}
        className={inputClass}
      />
      <textarea
        placeholder="Descrição completa"
        value={values.description}
        onChange={(e) => set("description", e.target.value)}
        rows={4}
        className={inputClass}
      />
      <textarea
        placeholder="Composição"
        value={values.composition}
        onChange={(e) => set("composition", e.target.value)}
        rows={2}
        className={inputClass}
      />
      <textarea
        placeholder="Tabela de medidas"
        value={values.sizeGuide}
        onChange={(e) => set("sizeGuide", e.target.value)}
        rows={3}
        className={inputClass}
      />

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-furikai-gray-500">Preço</label>
          <input
            type="number"
            step="0.01"
            value={values.price}
            onChange={(e) => set("price", Number(e.target.value))}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-xs text-furikai-gray-500">Custo</label>
          <input
            type="number"
            step="0.01"
            value={values.costPrice}
            onChange={(e) => set("costPrice", Number(e.target.value))}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-xs text-furikai-gray-500">Preço com desconto</label>
          <input
            type="number"
            step="0.01"
            value={values.discountPrice ?? ""}
            onChange={(e) => set("discountPrice", e.target.value ? Number(e.target.value) : null)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <select value={values.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={inputClass}>
          <option value="">Sem categoria</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select value={values.collectionId} onChange={(e) => set("collectionId", e.target.value)} className={inputClass}>
          <option value="">Sem coleção</option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        {(["featured", "limitedEdition", "isNew", "active"] as const).map((flag) => (
          <label key={flag} className="flex items-center gap-2">
            <input type="checkbox" checked={values[flag]} onChange={(e) => set(flag, e.target.checked)} />
            {flag === "featured" ? "Destaque" : flag === "limitedEdition" ? "Edição limitada" : flag === "isNew" ? "Novo" : "Ativo"}
          </label>
        ))}
      </div>

      <div>
        <p className="text-sm text-furikai-gray-400 mb-2">Variantes (cor / tamanho / SKU / estoque)</p>
        <div className="space-y-2">
          {values.variants.map((v, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_80px_32px] gap-2">
              <input placeholder="Cor" value={v.color} onChange={(e) => updateVariant(i, { color: e.target.value })} className={inputClass} />
              <input placeholder="Tamanho" value={v.size} onChange={(e) => updateVariant(i, { size: e.target.value })} className={inputClass} />
              <input placeholder="SKU" value={v.sku} onChange={(e) => updateVariant(i, { sku: e.target.value })} className={inputClass} />
              <input
                type="number"
                placeholder="Estoque"
                value={v.stock}
                onChange={(e) => updateVariant(i, { stock: Number(e.target.value) })}
                className={inputClass}
              />
              <button onClick={() => removeVariant(i)} className="text-furikai-gray-500 hover:text-furikai-red-bright">×</button>
            </div>
          ))}
        </div>
        <button onClick={addVariant} className="mt-2 text-xs underline text-furikai-gray-400 hover:text-furikai-white">
          + Adicionar variante
        </button>
      </div>

      <div>
        <p className="text-sm text-furikai-gray-400 mb-2">Imagens</p>
        {mediaImages.length > 0 && (
          <select onChange={(e) => addImage(e.target.value)} value="" className={`${inputClass} mb-2`}>
            <option value="">+ Adicionar da mídia enviada...</option>
            {mediaImages.map((m) => (
              <option key={m.url} value={m.url}>{m.url.split("/").pop()}</option>
            ))}
          </select>
        )}
        <div className="flex gap-2 mb-2">
          <input
            placeholder="Ou cole uma URL de imagem"
            id="manual-image-url"
            className={inputClass}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addImage((e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = "";
              }
            }}
          />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {values.images.map((img, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <div key={i} className="relative">
              <img src={img.url} alt={img.alt} className="w-full aspect-square object-cover border border-furikai-gray-700" />
              <button
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-black/70 text-white w-5 h-5 text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-furikai-red-bright">{error}</p>}
      <button
        onClick={submit}
        disabled={saving}
        className="px-8 py-3 bg-furikai-red-bright text-sm uppercase tracking-wider hover:bg-furikai-red transition-colors disabled:opacity-50"
      >
        {saving ? "Salvando..." : "Salvar produto"}
      </button>
    </div>
  );
}
