"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Search, User, Heart, ShoppingBag, LayoutDashboard } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useFavoritesStore } from "@/store/favorites";

const NAV = [
  { href: "/manifesto", label: "Manifesto" },
  { href: "/produtos", label: "Coleção" },
  { href: "/colecoes", label: "Coleções" },
  { href: "/comunidade", label: "Comunidade" },
  { href: "/suporte", label: "Suporte" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const count = useCartStore((s) => s.count());
  const openCart = useCartStore((s) => s.open);
  const favCount = useFavoritesStore((s) => s.ids.length);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  const isHome = pathname === "/";
  const transparent = isHome && !scrolled && !mobileOpen;
  const isStaff = session?.user?.role === "ADMIN" || session?.user?.role === "STAFF";

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-colors duration-500",
        transparent ? "bg-transparent" : "bg-furikai-black/90 backdrop-blur-md border-b border-white/5"
      )}
    >
      <div className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-10 h-16 md:h-20 flex items-center justify-between">
        <button
          className="md:hidden p-2 -ml-2 text-furikai-white"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className="hidden md:flex items-center gap-8 flex-1">
          {NAV.slice(0, 3).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm tracking-wide uppercase text-furikai-gray-300 hover:text-furikai-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          className="font-display text-2xl md:text-3xl tracking-[0.15em] text-furikai-white select-none"
        >
          FURIKAI
        </Link>

        <div className="flex items-center gap-4 md:gap-5 flex-1 justify-end">
          <nav className="hidden md:flex items-center gap-8 mr-2">
            {NAV.slice(3).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm tracking-wide uppercase text-furikai-gray-300 hover:text-furikai-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {isStaff && (
            <Link href="/admin" aria-label="Painel admin" className="hidden sm:block hover:opacity-70">
              <LayoutDashboard size={20} />
            </Link>
          )}
          <Link href="/produtos" aria-label="Buscar" className="hidden sm:block hover:opacity-70">
            <Search size={20} />
          </Link>
          <Link
            href={session ? "/minha-conta/favoritos" : "/entrar"}
            aria-label="Favoritos"
            className="relative hover:opacity-70"
          >
            <Heart size={20} />
            {favCount > 0 && (
              <span className="absolute -top-2 -right-2 text-[10px] bg-furikai-red-bright rounded-full w-4 h-4 flex items-center justify-center">
                {favCount}
              </span>
            )}
          </Link>
          <Link
            href={session ? "/minha-conta" : "/entrar"}
            aria-label="Minha conta"
            className="hover:opacity-70"
          >
            <User size={20} />
          </Link>
          <button aria-label="Carrinho" className="relative hover:opacity-70" onClick={openCart}>
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 text-[10px] bg-furikai-red-bright rounded-full w-4 h-4 flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden bg-furikai-black border-t border-white/5 px-6 py-6 flex flex-col gap-5">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-lg uppercase tracking-wide text-furikai-white"
            >
              {item.label}
            </Link>
          ))}
          {isStaff && (
            <Link href="/admin" className="text-lg uppercase tracking-wide text-furikai-white">
              Painel admin
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
