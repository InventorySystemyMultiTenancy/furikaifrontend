import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

export function isMercadoPagoConfigured() {
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
}

function getClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado");
  return new MercadoPagoConfig({ accessToken });
}

export type CheckoutItem = {
  id: string;
  title: string;
  quantity: number;
  unitPrice: number;
};

/**
 * Cria uma preferência do Checkout Pro. O Checkout Pro hospeda o formulário
 * de pagamento inteiro (Pix, cartão, boleto) no domínio do Mercado Pago —
 * por isso nenhum dado sensível de cartão passa pelo nosso backend.
 */
export async function createCheckoutPreference(params: {
  orderId: string;
  orderNumber: string;
  items: CheckoutItem[];
  shippingCost: number;
  discount: number;
  payerEmail: string;
  payerName: string;
}) {
  const client = getClient();
  const preference = new Preference(client);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const response = await preference.create({
    body: {
      items: params.items.map((i) => ({
        id: i.id,
        title: i.title,
        quantity: i.quantity,
        unit_price: i.unitPrice,
        currency_id: "BRL",
      })),
      shipments: {
        cost: params.shippingCost,
        mode: "not_specified",
      },
      payer: {
        email: params.payerEmail,
        name: params.payerName,
      },
      external_reference: params.orderId,
      back_urls: {
        success: `${appUrl}/checkout/sucesso?order=${params.orderId}`,
        failure: `${appUrl}/checkout/erro?order=${params.orderId}`,
        pending: `${appUrl}/checkout/pendente?order=${params.orderId}`,
      },
      auto_return: "approved",
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
      statement_descriptor: "FURIKAI",
    },
  });

  return response;
}

export async function getPayment(paymentId: string) {
  const client = getClient();
  const payment = new Payment(client);
  return payment.get({ id: paymentId });
}
