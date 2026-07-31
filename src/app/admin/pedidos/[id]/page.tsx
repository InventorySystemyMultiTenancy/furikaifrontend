"use client";

import { use, useEffect, useState } from "react";
import { formatBRL, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";

type OrderDetail = {
  id: string;
  number: string;
  status: string;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  trackingCode: string | null;
  carrier: string | null;
  createdAt: string;
  user: { name: string; email: string; phone: string | null };
  address: { street: string; number: string; neighborhood: string; city: string; state: string; zip: string } | null;
  items: { productName: string; variantLabel: string; unitPrice: number; quantity: number }[];
  payments: { method: string; status: string; amount: number }[];
};

const STATUSES = Object.keys(ORDER_STATUS_LABEL);

export default function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [trackingCode, setTrackingCode] = useState("");
  const [carrier, setCarrier] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  function load() {
    fetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setOrder(data.order);
        setTrackingCode(data.order.trackingCode ?? "");
        setCarrier(data.order.carrier ?? "");
      });
  }

  useEffect(load, [id]);

  async function updateStatus(status: string) {
    setSaving(true);
    setMsg("");
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSaving(false);
    setMsg(res.ok ? "Status atualizado." : "Erro ao atualizar.");
    load();
  }

  async function saveTracking() {
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackingCode, carrier }),
    });
    setSaving(false);
    setMsg(res.ok ? "Rastreio salvo." : "Erro ao salvar.");
    load();
  }

  if (!order) return <p className="text-furikai-gray-400">Carregando...</p>;

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl tracking-wide">Pedido {order.number}</h1>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 border border-furikai-gray-700 text-xs uppercase tracking-wide hover:border-furikai-white"
        >
          Imprimir
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-furikai-gray-700 p-4 text-sm">
          <p className="text-furikai-gray-500 mb-1">Cliente</p>
          <p>{order.user.name}</p>
          <p className="text-furikai-gray-400">{order.user.email}</p>
          {order.user.phone && <p className="text-furikai-gray-400">{order.user.phone}</p>}
        </div>
        {order.address && (
          <div className="border border-furikai-gray-700 p-4 text-sm">
            <p className="text-furikai-gray-500 mb-1">Entrega</p>
            <p>
              {order.address.street}, {order.address.number} — {order.address.neighborhood},{" "}
              {order.address.city}/{order.address.state} — {order.address.zip}
            </p>
          </div>
        )}
      </div>

      <div className="border border-furikai-gray-700 p-4 space-y-2 text-sm">
        {order.items.map((i, idx) => (
          <div key={idx} className="flex justify-between">
            <span>{i.quantity}x {i.productName} ({i.variantLabel})</span>
            <span>{formatBRL(i.unitPrice * i.quantity)}</span>
          </div>
        ))}
        <div className="border-t border-white/10 pt-2 flex justify-between">
          <span>Total</span>
          <span className="text-furikai-white">{formatBRL(order.total)}</span>
        </div>
        <p className="text-xs text-furikai-gray-500">Pedido em {formatDate(order.createdAt)}</p>
        {order.payments.map((p, i) => (
          <p key={i} className="text-xs text-furikai-gray-500">
            Pagamento: {p.method} — {p.status}
          </p>
        ))}
      </div>

      <div className="space-y-3">
        <p className="text-sm text-furikai-gray-400">Status do pedido</p>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              disabled={saving}
              onClick={() => updateStatus(s)}
              className={`px-3 py-2 text-xs uppercase tracking-wide border ${
                order.status === s ? "border-furikai-white bg-furikai-white text-furikai-black" : "border-furikai-gray-700"
              }`}
            >
              {ORDER_STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-furikai-gray-400">Rastreamento</p>
        <div className="flex gap-3">
          <input
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            placeholder="Transportadora"
            className="flex-1 bg-transparent border border-furikai-gray-700 px-3 py-2 text-sm"
          />
          <input
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            placeholder="Código de rastreio"
            className="flex-1 bg-transparent border border-furikai-gray-700 px-3 py-2 text-sm"
          />
          <button onClick={saveTracking} className="px-4 py-2 bg-furikai-white text-furikai-black text-xs uppercase tracking-wide">
            Salvar
          </button>
        </div>
      </div>

      {msg && <p className="text-xs text-furikai-white">{msg}</p>}
    </div>
  );
}
