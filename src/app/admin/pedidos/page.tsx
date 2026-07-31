"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatBRL, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/lib/order-status";

type OrderRow = {
  id: string;
  number: string;
  status: string;
  total: number;
  itemCount: number;
  customer: { name: string; email: string };
  createdAt: string;
};

const STATUSES = Object.keys(ORDER_STATUS_LABEL);

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);

  function load() {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (status) params.set("status", status);
    params.set("page", String(page));
    fetch(`/api/admin/orders?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders);
        setPageCount(data.pageCount);
      });
  }

  useEffect(load, [search, status, page]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-display text-3xl tracking-wide">Pedidos</h1>
        <a
          href={`/api/admin/orders/export${status ? `?status=${status}` : ""}`}
          className="px-4 py-2 border border-furikai-white text-xs uppercase tracking-wide hover:bg-furikai-white hover:text-furikai-black"
        >
          Exportar CSV
        </a>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Buscar por número, nome ou e-mail"
          className="flex-1 min-w-[220px] bg-transparent border border-furikai-gray-700 px-3 py-2 text-sm focus:outline-none focus:border-furikai-white"
        />
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="bg-furikai-black border border-furikai-gray-700 px-3 py-2 text-sm"
        >
          <option value="">Todos status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-furikai-gray-500 uppercase text-xs border-b border-white/10">
              <th className="py-2 pr-4">Pedido</th>
              <th className="py-2 pr-4">Cliente</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Total</th>
              <th className="py-2 pr-4">Data</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-3 pr-4">
                  <Link href={`/admin/pedidos/${o.id}`} className="text-furikai-white hover:underline">
                    {o.number}
                  </Link>
                </td>
                <td className="py-3 pr-4">
                  <p>{o.customer.name}</p>
                  <p className="text-xs text-furikai-gray-500">{o.customer.email}</p>
                </td>
                <td className={`py-3 pr-4 ${ORDER_STATUS_COLOR[o.status]}`}>{ORDER_STATUS_LABEL[o.status]}</td>
                <td className="py-3 pr-4">{formatBRL(o.total)}</td>
                <td className="py-3 pr-4 text-furikai-gray-400">{formatDate(o.createdAt)}</td>
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
