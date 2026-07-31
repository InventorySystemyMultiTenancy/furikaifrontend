export const ORDER_STATUS_LABEL: Record<string, string> = {
  AWAITING_PAYMENT: "Aguardando pagamento",
  PAID: "Pago",
  PROCESSING: "Em separação",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

export const ORDER_STATUS_COLOR: Record<string, string> = {
  AWAITING_PAYMENT: "text-furikai-gray-400",
  PAID: "text-furikai-white",
  PROCESSING: "text-furikai-metal",
  SHIPPED: "text-furikai-white",
  DELIVERED: "text-green-400",
  CANCELLED: "text-furikai-red-bright",
  REFUNDED: "text-furikai-red-bright",
};
