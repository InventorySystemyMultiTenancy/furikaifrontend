"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/usuarios", label: "Usuários" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/colecoes", label: "Coleções" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/cupons", label: "Cupons" },
  { href: "/admin/midia", label: "Mídia" },
  { href: "/admin/financeiro", label: "Financeiro" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:w-56 flex-shrink-0 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "px-4 py-2.5 text-sm whitespace-nowrap uppercase tracking-wide border-l-2",
            pathname === link.href
              ? "border-furikai-red-bright bg-white/5 text-furikai-white"
              : "border-transparent text-furikai-gray-400 hover:text-furikai-white"
          )}
        >
          {link.label}
        </Link>
      ))}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="px-4 py-2.5 text-sm whitespace-nowrap uppercase tracking-wide text-furikai-gray-400 hover:text-furikai-red-bright text-left"
      >
        Sair
      </button>
    </nav>
  );
}
