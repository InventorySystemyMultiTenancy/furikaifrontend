/**
 * Cálculo de frete por CEP.
 *
 * Não há contrato com transportadora configurado ainda, então usamos uma
 * estimativa determinística por região (a partir do CEP de origem da loja,
 * `STORE_ORIGIN_ZIP`) e pelo peso aproximado do carrinho. A interface foi
 * desenhada para ser substituída por uma chamada real (Correios, Melhor
 * Envio etc.) sem alterar quem a consome — troque apenas o corpo de
 * `calculateShipping`.
 */

export type ShippingQuote = {
  service: string;
  label: string;
  price: number;
  etaDaysMin: number;
  etaDaysMax: number;
};

function regionOf(zip: string): number {
  const first = Number(zip.replace(/\D/g, "").charAt(0) || "0");
  return first;
}

export function calculateShipping(destinationZip: string, totalWeightKg: number): ShippingQuote[] {
  const originZip = process.env.STORE_ORIGIN_ZIP ?? "01310930";
  const cleanZip = destinationZip.replace(/\D/g, "");

  if (cleanZip.length !== 8) {
    throw new Error("CEP inválido");
  }

  const originRegion = regionOf(originZip);
  const destRegion = regionOf(cleanZip);
  const distanceFactor = 1 + Math.abs(originRegion - destRegion) * 0.18;
  const weightFactor = Math.max(1, totalWeightKg);

  const basePac = 18.9 * distanceFactor * (0.6 + weightFactor * 0.25);
  const baseSedex = basePac * 1.75;

  const isSameRegion = originRegion === destRegion;

  return [
    {
      service: "PAC",
      label: "Envio econômico",
      price: Math.round(basePac * 100) / 100,
      etaDaysMin: isSameRegion ? 3 : 6,
      etaDaysMax: isSameRegion ? 6 : 12,
    },
    {
      service: "SEDEX",
      label: "Envio expresso",
      price: Math.round(baseSedex * 100) / 100,
      etaDaysMin: isSameRegion ? 1 : 2,
      etaDaysMax: isSameRegion ? 2 : 5,
    },
  ];
}

export const DEFAULT_ITEM_WEIGHT_KG = 0.35;
