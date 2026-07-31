"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatBRL } from "@/lib/utils";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  blocked: boolean;
  orderCount: number;
  totalSpent: number;
};

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    params.set("page", String(page));
    fetch(`/api/admin/users?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users);
        setPageCount(data.pageCount);
      });
  }, [search, page]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-display text-3xl tracking-wide">Usuários</h1>
        <a
          href="/api/admin/users/export"
          className="px-4 py-2 border border-furikai-white text-xs uppercase tracking-wide hover:bg-furikai-white hover:text-furikai-black"
        >
          Exportar CSV
        </a>
      </div>

      <input
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
        placeholder="Buscar por nome ou e-mail"
        className="w-full max-w-md bg-transparent border border-furikai-gray-700 px-3 py-2 text-sm"
      />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-furikai-gray-500 uppercase text-xs border-b border-white/10">
              <th className="py-2 pr-4">Nome</th>
              <th className="py-2 pr-4">Papel</th>
              <th className="py-2 pr-4">Pedidos</th>
              <th className="py-2 pr-4">Total gasto</th>
              <th className="py-2 pr-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-3 pr-4">
                  <Link href={`/admin/usuarios/${u.id}`} className="text-furikai-white hover:underline">
                    {u.name}
                  </Link>
                  <p className="text-xs text-furikai-gray-500">{u.email}</p>
                </td>
                <td className="py-3 pr-4">{u.role}</td>
                <td className="py-3 pr-4">{u.orderCount}</td>
                <td className="py-3 pr-4">{formatBRL(u.totalSpent)}</td>
                <td className="py-3 pr-4">
                  {u.blocked ? (
                    <span className="text-furikai-red-bright">Bloqueado</span>
                  ) : (
                    <span className="text-green-400">Ativo</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex gap-2">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 text-xs border ${page === i + 1 ? "border-furikai-white" : "border-furikai-gray-700"}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
