import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AccountDashboard() {
  const session = await auth();
  const [orderCount, favoriteCount] = await Promise.all([
    prisma.order.count({ where: { userId: session!.user.id } }),
    prisma.favorite.count({ where: { userId: session!.user.id } }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-4xl tracking-wide">Olá, {session?.user.name}</h1>
      <p className="text-furikai-gray-400">Bem-vindo à sua área Furikai.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Link href="/minha-conta/pedidos" className="border border-furikai-gray-700 p-6 hover:border-furikai-white transition-colors">
          <p className="text-3xl font-display">{orderCount}</p>
          <p className="text-sm text-furikai-gray-400 mt-1">Pedidos</p>
        </Link>
        <Link href="/minha-conta/favoritos" className="border border-furikai-gray-700 p-6 hover:border-furikai-white transition-colors">
          <p className="text-3xl font-display">{favoriteCount}</p>
          <p className="text-sm text-furikai-gray-400 mt-1">Favoritos</p>
        </Link>
        <Link href="/minha-conta/enderecos" className="border border-furikai-gray-700 p-6 hover:border-furikai-white transition-colors">
          <p className="text-3xl font-display">→</p>
          <p className="text-sm text-furikai-gray-400 mt-1">Endereços</p>
        </Link>
      </div>
    </div>
  );
}
