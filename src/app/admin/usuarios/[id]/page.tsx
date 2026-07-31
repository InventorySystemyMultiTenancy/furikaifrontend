"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { formatBRL, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";

type UserDetail = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  blocked: boolean;
  totalSpent: number;
  orders: { id: string; number: string; status: string; total: number; createdAt: string }[];
};

export default function AdminUserDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<UserDetail | null>(null);
  const [msg, setMsg] = useState("");

  function load() {
    fetch(`/api/admin/users/${id}`)
      .then((r) => r.json())
      .then((data) => setUser(data.user));
  }

  useEffect(load, [id]);

  async function patch(data: Record<string, unknown>) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setMsg(res.ok ? "Atualizado." : "Erro ao atualizar.");
    load();
  }

  if (!user) return <p className="text-furikai-gray-400">Carregando...</p>;

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="font-display text-3xl tracking-wide">{user.name}</h1>
      <p className="text-furikai-gray-400 text-sm">{user.email} {user.phone && `· ${user.phone}`}</p>

      <div className="flex flex-wrap gap-4 items-center">
        <select
          value={user.role}
          onChange={(e) => patch({ role: e.target.value })}
          className="bg-furikai-black border border-furikai-gray-700 px-3 py-2 text-sm"
        >
          <option value="CUSTOMER">Cliente</option>
          <option value="STAFF">Funcionário</option>
          <option value="ADMIN">Administrador</option>
        </select>
        <button
          onClick={() => patch({ blocked: !user.blocked })}
          className={`px-4 py-2 text-xs uppercase tracking-wide border ${
            user.blocked ? "border-furikai-white" : "border-furikai-red-bright text-furikai-red-bright"
          }`}
        >
          {user.blocked ? "Desbloquear" : "Bloquear usuário"}
        </button>
        {msg && <span className="text-xs text-furikai-gray-400">{msg}</span>}
      </div>

      <div>
        <p className="text-sm text-furikai-gray-400 mb-3">Total gasto: {formatBRL(user.totalSpent)}</p>
        <h2 className="font-display text-xl tracking-wide mb-3">Histórico de pedidos</h2>
        <div className="space-y-2">
          {user.orders.map((o) => (
            <Link
              key={o.id}
              href={`/admin/pedidos/${o.id}`}
              className="flex justify-between border border-furikai-gray-700 p-3 text-sm hover:border-furikai-white"
            >
              <span>{o.number} · {ORDER_STATUS_LABEL[o.status]}</span>
              <span>{formatBRL(o.total)} · {formatDate(o.createdAt)}</span>
            </Link>
          ))}
          {user.orders.length === 0 && <p className="text-sm text-furikai-gray-500">Nenhum pedido ainda.</p>}
        </div>
      </div>
    </div>
  );
}
