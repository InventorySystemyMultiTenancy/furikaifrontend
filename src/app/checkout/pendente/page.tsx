import { Suspense } from "react";
import { OrderResult } from "@/components/shop/order-result";

export default function Page() {
  return (
    <Suspense>
      <OrderResult
        tone="pending"
        title="Pagamento em análise"
        description="Assim que o pagamento for confirmado, atualizaremos seu pedido automaticamente."
      />
    </Suspense>
  );
}
