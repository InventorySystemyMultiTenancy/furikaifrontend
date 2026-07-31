import { Suspense } from "react";
import { OrderResult } from "@/components/shop/order-result";

export default function Page() {
  return (
    <Suspense>
      <OrderResult
        tone="success"
        title="Pagamento aprovado"
        description="Seu pedido foi confirmado. Em breve você receberá atualizações por e-mail."
      />
    </Suspense>
  );
}
