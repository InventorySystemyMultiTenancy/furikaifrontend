"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/minha-conta", label: "Visão geral" },
  { href: "/minha-conta/pedidos", label: "Meus pedidos" },
  { href: "/minha-conta/enderecos", label: "Endereços" },
  { href: "/minha-conta/favoritos", label: "Favoritos" },
  { href: "/minha-conta/dados", label: "Meus dados" },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible lg:w-56 flex-shrink-0">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "px-4 py-2.5 text-sm whitespace-nowrap uppercase tracking-wide border-l-2",
            pathname === link.href
              ? "border-furikai-red-bright text-furikai-white bg-white/5"
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
