"use client";

import { useState } from "react";

export type AddressFormValues = {
  label: string;
  recipientName: string;
  zip: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  phone: string;
  isDefault: boolean;
};

const EMPTY: AddressFormValues = {
  label: "Endereço",
  recipientName: "",
  zip: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  phone: "",
  isDefault: false,
};

export function AddressForm({
  onSaved,
  onCancel,
}: {
  onSaved: (address: { id: string }) => void;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<AddressFormValues>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof AddressFormValues>(key: K, value: AddressFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function lookupZip(zip: string) {
    const clean = zip.replace(/\D/g, "");
    if (clean.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setValues((v) => ({
          ...v,
          street: data.logradouro || v.street,
          neighborhood: data.bairro || v.neighborhood,
          city: data.localidade || v.city,
          state: data.uf || v.state,
        }));
      }
    } catch {
      // silencioso — usuário pode preencher manualmente
    }
  }

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, zip: values.zip.replace(/\D/g, "") }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSaved(data.address);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar endereço.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full bg-transparent border border-furikai-gray-700 px-3 py-2 text-sm focus:outline-none focus:border-furikai-white";

  return (
    <div className="space-y-3 border border-furikai-gray-700 p-4">
      <input
        placeholder="Nome do destinatário"
        value={values.recipientName}
        onChange={(e) => set("recipientName", e.target.value)}
        className={inputClass}
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          placeholder="CEP"
          value={values.zip}
          onChange={(e) => set("zip", e.target.value)}
          onBlur={(e) => lookupZip(e.target.value)}
          className={inputClass}
        />
        <input
          placeholder="Telefone"
          value={values.phone}
          onChange={(e) => set("phone", e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <input
          placeholder="Rua"
          value={values.street}
          onChange={(e) => set("street", e.target.value)}
          className={`${inputClass} col-span-2`}
        />
        <input
          placeholder="Número"
          value={values.number}
          onChange={(e) => set("number", e.target.value)}
          className={inputClass}
        />
      </div>
      <input
        placeholder="Complemento (opcional)"
        value={values.complement}
        onChange={(e) => set("complement", e.target.value)}
        className={inputClass}
      />
      <div className="grid grid-cols-3 gap-3">
        <input
          placeholder="Bairro"
          value={values.neighborhood}
          onChange={(e) => set("neighborhood", e.target.value)}
          className={inputClass}
        />
        <input
          placeholder="Cidade"
          value={values.city}
          onChange={(e) => set("city", e.target.value)}
          className={inputClass}
        />
        <input
          placeholder="UF"
          maxLength={2}
          value={values.state}
          onChange={(e) => set("state", e.target.value.toUpperCase())}
          className={inputClass}
        />
      </div>
      <label className="flex items-center gap-2 text-xs text-furikai-gray-400">
        <input
          type="checkbox"
          checked={values.isDefault}
          onChange={(e) => set("isDefault", e.target.checked)}
        />
        Definir como endereço padrão
      </label>
      {error && <p className="text-xs text-furikai-red-bright">{error}</p>}
      <div className="flex gap-3">
        <button
          onClick={submit}
          disabled={loading}
          className="px-5 py-2 bg-furikai-white text-furikai-black text-sm uppercase tracking-wide hover:bg-furikai-red-bright hover:text-furikai-white transition-colors disabled:opacity-50"
        >
          Salvar endereço
        </button>
        {onCancel && (
          <button onClick={onCancel} className="text-sm text-furikai-gray-400 hover:text-furikai-white">
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
