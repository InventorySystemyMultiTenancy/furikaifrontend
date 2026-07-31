"use client";

import { useEffect, useState } from "react";
import { AddressForm } from "@/components/account/address-form";

type Address = {
  id: string;
  label: string;
  recipientName: string;
  zip: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  isDefault: boolean;
};

export default function EnderecosPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);

  function load() {
    fetch("/api/account/addresses")
      .then((r) => r.json())
      .then((data) => setAddresses(data.addresses ?? []));
  }

  useEffect(load, []);

  async function remove(id: string) {
    await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
    load();
  }

  async function setDefault(id: string) {
    await fetch(`/api/account/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl tracking-wide">Endereços</h1>

      {addresses.map((a) => (
        <div key={a.id} className="border border-furikai-gray-700 p-4 flex justify-between items-start gap-4">
          <div className="text-sm">
            <p className="text-furikai-white">
              {a.recipientName} {a.isDefault && <span className="text-xs text-furikai-red-bright ml-2">Padrão</span>}
            </p>
            <p className="text-furikai-gray-400 mt-1">
              {a.street}, {a.number} — {a.neighborhood}, {a.city}/{a.state} — {a.zip}
            </p>
          </div>
          <div className="flex flex-col gap-2 text-xs">
            {!a.isDefault && (
              <button onClick={() => setDefault(a.id)} className="text-furikai-gray-400 hover:text-furikai-white">
                Tornar padrão
              </button>
            )}
            <button onClick={() => remove(a.id)} className="text-furikai-gray-400 hover:text-furikai-red-bright">
              Remover
            </button>
          </div>
        </div>
      ))}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 border border-furikai-white text-sm uppercase tracking-wider hover:bg-furikai-white hover:text-furikai-black transition-colors"
        >
          + Novo endereço
        </button>
      ) : (
        <AddressForm
          onSaved={() => {
            setShowForm(false);
            load();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
