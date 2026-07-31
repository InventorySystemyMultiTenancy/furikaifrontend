"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { formatBRL, cn } from "@/lib/utils";
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
};

type ShippingQuote = { service: string; label: string; price: number; etaDaysMin: number; etaDaysMax: number };

const STEPS = ["Endereço", "Entrega", "Pagamento", "Revisão"] as const;

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const couponCode = useCartStore((s) => s.couponCode);
  const clearCart = useCartStore((s) => s.clear);
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState<string>("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [quotes, setQuotes] = useState<ShippingQuote[]>([]);
  const [shippingService, setShippingService] = useState<"PAC" | "SEDEX">("PAC");
  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CREDIT_CARD" | "BOLETO">("PIX");
  const [pricing, setPricing] = useState<{ subtotal: number; discount: number; total: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (items.length === 0) router.replace("/carrinho");
  }, [items, router]);

  useEffect(() => {
    fetch("/api/account/addresses")
      .then((r) => r.json())
      .then((data) => {
        setAddresses(data.addresses ?? []);
        const def = data.addresses?.find((a: Address & { isDefault?: boolean }) => a.isDefault);
        if (def) setAddressId(def.id);
        else if (data.addresses?.[0]) setAddressId(data.addresses[0].id);
      });
  }, []);

  const selectedAddress = addresses.find((a) => a.id === addressId);

  useEffect(() => {
    if (!selectedAddress) return;
    const qty = items.reduce((s, i) => s + i.quantity, 0);
    fetch(`/api/shipping?zip=${selectedAddress.zip.replace(/\D/g, "")}&items=${qty}`)
      .then((r) => r.json())
      .then((data) => setQuotes(data.quotes ?? []));
  }, [selectedAddress, items]);

  useEffect(() => {
    const quote = quotes.find((q) => q.service === shippingService);
    fetch("/api/cart/price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        couponCode,
        shippingCost: quote?.price ?? 0,
      }),
    })
      .then((r) => r.json())
      .then(setPricing);
  }, [quotes, shippingService, items, couponCode]);

  async function confirmOrder() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          addressId,
          shippingService,
          paymentMethod,
          couponCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      clearCart();
      window.location.href = data.redirectUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao finalizar pedido.");
      setSubmitting(false);
    }
  }

  const selectedQuote = quotes.find((q) => q.service === shippingService);

  return (
    <div className="pt-32 pb-24 px-6 lg:px-10 min-h-[70vh]">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-4xl tracking-wide mb-8">Checkout</h1>

        <div className="flex gap-4 mb-10 text-xs uppercase tracking-wider">
          {STEPS.map((s, i) => (
            <div key={s} className={cn("flex items-center gap-2", i <= step ? "text-furikai-white" : "text-furikai-gray-600")}>
              <span
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center border",
                  i <= step ? "border-furikai-white bg-furikai-white text-furikai-black" : "border-furikai-gray-700"
                )}
              >
                {i + 1}
              </span>
              {s}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            {addresses.map((a) => (
              <label
                key={a.id}
                className={cn(
                  "block border p-4 cursor-pointer",
                  addressId === a.id ? "border-furikai-white" : "border-furikai-gray-700"
                )}
              >
                <input
                  type="radio"
                  name="address"
                  className="mr-3"
                  checked={addressId === a.id}
                  onChange={() => setAddressId(a.id)}
                />
                <span className="text-sm">
                  {a.recipientName} — {a.street}, {a.number} — {a.neighborhood}, {a.city}/{a.state} —{" "}
                  {a.zip}
                </span>
              </label>
            ))}

            {!showAddressForm ? (
              <button
                onClick={() => setShowAddressForm(true)}
                className="text-sm underline text-furikai-gray-300 hover:text-furikai-white"
              >
                + Adicionar novo endereço
              </button>
            ) : (
              <AddressForm
                onSaved={(addr) => {
                  setShowAddressForm(false);
                  setAddresses((prev) => [...prev, addr as Address]);
                  setAddressId(addr.id);
                }}
                onCancel={() => setShowAddressForm(false)}
              />
            )}

            <button
              disabled={!addressId}
              onClick={() => setStep(1)}
              className="mt-6 px-8 py-3 bg-furikai-red-bright text-sm uppercase tracking-wider hover:bg-furikai-red transition-colors disabled:opacity-40"
            >
              Continuar
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            {quotes.map((q) => (
              <label
                key={q.service}
                className={cn(
                  "flex justify-between items-center border p-4 cursor-pointer",
                  shippingService === q.service ? "border-furikai-white" : "border-furikai-gray-700"
                )}
              >
                <span>
                  <input
                    type="radio"
                    name="shipping"
                    className="mr-3"
                    checked={shippingService === q.service}
                    onChange={() => setShippingService(q.service as "PAC" | "SEDEX")}
                  />
                  {q.label} — {q.etaDaysMin} a {q.etaDaysMax} dias úteis
                </span>
                <span>{formatBRL(q.price)}</span>
              </label>
            ))}
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(0)} className="px-6 py-3 border border-furikai-gray-700 text-sm uppercase tracking-wider">
                Voltar
              </button>
              <button
                onClick={() => setStep(2)}
                className="px-8 py-3 bg-furikai-red-bright text-sm uppercase tracking-wider hover:bg-furikai-red transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {[
              { id: "PIX", label: "Pix", desc: "Aprovação instantânea" },
              { id: "CREDIT_CARD", label: "Cartão de crédito", desc: "Em até 3x sem juros" },
              { id: "BOLETO", label: "Boleto", desc: "Compensação em até 2 dias úteis" },
            ].map((m) => (
              <label
                key={m.id}
                className={cn(
                  "flex justify-between items-center border p-4 cursor-pointer",
                  paymentMethod === m.id ? "border-furikai-white" : "border-furikai-gray-700"
                )}
              >
                <span>
                  <input
                    type="radio"
                    name="payment"
                    className="mr-3"
                    checked={paymentMethod === m.id}
                    onChange={() => setPaymentMethod(m.id as typeof paymentMethod)}
                  />
                  {m.label}
                </span>
                <span className="text-xs text-furikai-gray-500">{m.desc}</span>
              </label>
            ))}
            <p className="text-xs text-furikai-gray-500">
              O pagamento é processado com segurança pelo Mercado Pago. Nenhum dado de cartão é
              armazenado pela Furikai.
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="px-6 py-3 border border-furikai-gray-700 text-sm uppercase tracking-wider">
                Voltar
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-8 py-3 bg-furikai-red-bright text-sm uppercase tracking-wider hover:bg-furikai-red transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="border border-furikai-gray-700 p-4 space-y-2 text-sm">
              {items.map((i) => (
                <div key={i.variantId} className="flex justify-between">
                  <span>
                    {i.name} ({i.size}) x{i.quantity}
                  </span>
                  <span>{formatBRL(i.price * i.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-white/10 pt-2 flex justify-between">
                <span>Subtotal</span>
                <span>{formatBRL(pricing?.subtotal ?? 0)}</span>
              </div>
              {(pricing?.discount ?? 0) > 0 && (
                <div className="flex justify-between">
                  <span>Desconto</span>
                  <span>- {formatBRL(pricing?.discount ?? 0)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Frete ({shippingService})</span>
                <span>{formatBRL(selectedQuote?.price ?? 0)}</span>
              </div>
              <div className="flex justify-between text-base border-t border-white/10 pt-2">
                <span>Total</span>
                <span className="text-furikai-white">{formatBRL(pricing?.total ?? 0)}</span>
              </div>
            </div>
            {error && <p className="text-sm text-furikai-red-bright">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="px-6 py-3 border border-furikai-gray-700 text-sm uppercase tracking-wider">
                Voltar
              </button>
              <button
                onClick={confirmOrder}
                disabled={submitting}
                className="px-8 py-3 bg-furikai-red-bright text-sm uppercase tracking-wider hover:bg-furikai-red transition-colors disabled:opacity-50"
              >
                {submitting ? "Processando..." : "Confirmar e pagar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
