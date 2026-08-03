"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, type FormEvent } from "react";
import { Camera, PlayCircle, MessageCircle } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <footer className="bg-furikai-black-soft border-t border-white/5 text-furikai-gray-300">
      <div className="mx-auto max-w-[1800px] px-6 lg:px-10 py-16 grid grid-cols-1 md:grid-cols-5 gap-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <Image src="/assets/logos/ativo-14.png" alt="Furikai" width={44} height={44} className="object-contain" />
            <p className="font-display text-3xl tracking-[0.15em] text-furikai-white">FURIKAI</p>
          </div>
          <p className="text-sm max-w-xs leading-relaxed">
            Clube automotivo de identidade urbana e japonesa. Streetwear premium construído para
            quem vive o asfalto, a fumaça e as luzes da noite.
          </p>
          <div className="flex gap-4 mt-6">
            <a href="#" aria-label="Instagram" className="hover:text-furikai-white"><Camera size={20} /></a>
            <a href="#" aria-label="YouTube" className="hover:text-furikai-white"><PlayCircle size={20} /></a>
            <a href="#" aria-label="WhatsApp" className="hover:text-furikai-white"><MessageCircle size={20} /></a>
          </div>
        </div>

        <div>
          <h3 className="text-furikai-white text-sm uppercase tracking-wider mb-4">Navegação</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="/produtos" className="hover:text-furikai-white">Loja</Link></li>
            <li><Link href="/colecoes" className="hover:text-furikai-white">Coleções</Link></li>
            <li><Link href="/comunidade" className="hover:text-furikai-white">Comunidade</Link></li>
            <li><Link href="/manifesto" className="hover:text-furikai-white">Manifesto</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-furikai-white text-sm uppercase tracking-wider mb-4">Atendimento</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="/suporte" className="hover:text-furikai-white">Contato</Link></li>
            <li><Link href="/suporte/rastreio" className="hover:text-furikai-white">Rastrear pedido</Link></li>
            <li><Link href="/suporte/trocas" className="hover:text-furikai-white">Política de troca</Link></li>
            <li><Link href="/suporte/privacidade" className="hover:text-furikai-white">Política de privacidade</Link></li>
            <li><Link href="/suporte/termos" className="hover:text-furikai-white">Termos de uso</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-furikai-white text-sm uppercase tracking-wider mb-4">Fique por dentro</h3>
          <p className="text-sm mb-4">Lançamentos e drops limitados antes de todo mundo.</p>
          <form onSubmit={onSubmit} className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="flex-1 min-w-0 bg-transparent border border-furikai-gray-700 px-3 py-2 text-sm text-furikai-white placeholder:text-furikai-gray-500 focus:outline-none focus:border-furikai-red-bright"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-4 py-2 bg-furikai-red-bright text-furikai-white text-sm uppercase tracking-wide hover:bg-furikai-red transition-colors disabled:opacity-50"
            >
              OK
            </button>
          </form>
          {status === "done" && <p className="text-xs mt-2 text-furikai-white">Inscrito com sucesso.</p>}
          {status === "error" && <p className="text-xs mt-2 text-furikai-red-bright">Erro ao inscrever.</p>}
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto max-w-[1800px] px-6 lg:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} Furikai. Todos os direitos reservados.</p>
          <div className="flex items-center gap-3 opacity-70">
            <span className="border border-furikai-gray-700 px-2 py-1 rounded">Pix</span>
            <span className="border border-furikai-gray-700 px-2 py-1 rounded">Cartão</span>
            <span className="border border-furikai-gray-700 px-2 py-1 rounded">Boleto</span>
            <span className="border border-furikai-gray-700 px-2 py-1 rounded">Mercado Pago</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
