"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { StatCard } from "@/components/admin/stat-card";
import { PeriodFilter, type Period } from "@/components/admin/period-filter";
import { formatBRL } from "@/lib/utils";

type Stats = {
  kpis: Record<string, number>;
  topProducts: { name: string; quantity: number; revenue: number }[];
  salesByDay: { date: string; total: number }[];
  salesByCategory: { category: string; total: number }[];
  lowStock: { id: string; productName: string; size: string; color: string | null; stock: number }[];
};

const COLORS = ["#9c1119", "#8a8d91", "#f2f1ee", "#3a3a3d", "#6e0d14"];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  function load(period?: Period) {
    const params = new URLSearchParams();
    if (period) {
      params.set("from", period.from);
      params.set("to", period.to);
    }
    fetch(`/api/admin/stats?${params.toString()}`)
      .then((r) => r.json())
      .then(setStats);
  }

  useEffect(() => load(), []);

  if (!stats) return <p className="text-furikai-gray-400">Carregando...</p>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-display text-3xl tracking-wide">Dashboard</h1>
        <PeriodFilter onChange={load} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Faturamento total" value={formatBRL(stats.kpis.faturamentoTotal)} />
        <StatCard label="Faturamento no período" value={formatBRL(stats.kpis.faturamentoMes)} />
        <StatCard label="Lucro" value={formatBRL(stats.kpis.lucro)} />
        <StatCard label="Gastos" value={formatBRL(stats.kpis.gastos)} />
        <StatCard label="Ticket médio" value={formatBRL(stats.kpis.ticketMedio)} />
        <StatCard label="Pedidos no período" value={String(stats.kpis.numeroPedidos)} />
        <StatCard label="Pedidos pendentes" value={String(stats.kpis.pedidosPendentes)} />
        <StatCard label="Clientes novos" value={String(stats.kpis.clientesNovos)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-furikai-gray-700 p-5">
          <p className="text-sm text-furikai-gray-400 mb-4">Vendas por dia</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={stats.salesByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3d" />
              <XAxis dataKey="date" stroke="#6b6b6f" fontSize={11} />
              <YAxis stroke="#6b6b6f" fontSize={11} />
              <Tooltip
                contentStyle={{ background: "#121214", border: "1px solid #3a3a3d" }}
                formatter={(v: number) => formatBRL(v)}
              />
              <Line type="monotone" dataKey="total" stroke="#9c1119" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="border border-furikai-gray-700 p-5">
          <p className="text-sm text-furikai-gray-400 mb-4">Vendas por categoria</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={stats.salesByCategory} dataKey="total" nameKey="category" outerRadius={90}>
                {stats.salesByCategory.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#121214", border: "1px solid #3a3a3d" }}
                formatter={(v: number) => formatBRL(v)}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-furikai-gray-700 p-5">
          <p className="text-sm text-furikai-gray-400 mb-4">Produtos mais vendidos</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.topProducts} layout="vertical">
              <XAxis type="number" stroke="#6b6b6f" fontSize={11} />
              <YAxis type="category" dataKey="name" stroke="#6b6b6f" fontSize={11} width={120} />
              <Tooltip contentStyle={{ background: "#121214", border: "1px solid #3a3a3d" }} />
              <Bar dataKey="quantity" fill="#9c1119" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="border border-furikai-gray-700 p-5">
          <p className="text-sm text-furikai-gray-400 mb-4">Estoque baixo</p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {stats.lowStock.length === 0 && <p className="text-xs text-furikai-gray-500">Nenhum item com estoque baixo.</p>}
            {stats.lowStock.map((v) => (
              <div key={v.id} className="flex justify-between text-sm">
                <span>{v.productName} ({v.color ?? "-"} / {v.size})</span>
                <span className={v.stock === 0 ? "text-furikai-red-bright" : "text-furikai-gray-300"}>
                  {v.stock} un.
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
