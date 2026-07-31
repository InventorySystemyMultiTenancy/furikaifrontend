"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

export type ReviewItem = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string };
};

export function Reviews({ productId, reviews }: { productId: string; reviews: ReviewItem[] }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const average =
    reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setComment("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao enviar avaliação.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={16}
              className={i < Math.round(average) ? "fill-furikai-white text-furikai-white" : "text-furikai-gray-700"}
            />
          ))}
        </div>
        <span className="text-sm text-furikai-gray-400">
          {average.toFixed(1)} · {reviews.length} avaliações
        </span>
      </div>

      <div className="space-y-5">
        {reviews.map((r) => (
          <div key={r.id} className="border-b border-white/5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    className={i < r.rating ? "fill-furikai-white text-furikai-white" : "text-furikai-gray-700"}
                  />
                ))}
              </div>
              <span className="text-xs text-furikai-gray-500">
                {r.user.name} · {formatDate(r.createdAt)}
              </span>
            </div>
            {r.comment && <p className="text-sm text-furikai-gray-300">{r.comment}</p>}
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-sm text-furikai-gray-500">Seja o primeiro a avaliar este produto.</p>
        )}
      </div>

      {session?.user ? (
        <div className="border border-furikai-gray-700 p-4 space-y-3">
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button key={i} onClick={() => setRating(i + 1)} aria-label={`${i + 1} estrelas`}>
                <Star
                  size={20}
                  className={i < rating ? "fill-furikai-white text-furikai-white" : "text-furikai-gray-700"}
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Conte como foi sua experiência..."
            rows={3}
            className="w-full bg-transparent border border-furikai-gray-700 px-3 py-2 text-sm focus:outline-none focus:border-furikai-white"
          />
          {error && <p className="text-xs text-furikai-red-bright">{error}</p>}
          <button
            onClick={submit}
            disabled={submitting}
            className="px-5 py-2 bg-furikai-white text-furikai-black text-sm uppercase tracking-wide hover:bg-furikai-red-bright hover:text-furikai-white transition-colors disabled:opacity-50"
          >
            Enviar avaliação
          </button>
        </div>
      ) : (
        <p className="text-sm text-furikai-gray-500">Faça login para avaliar este produto.</p>
      )}
    </div>
  );
}
