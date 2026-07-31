import { Suspense } from "react";
import { OrderResult } from "@/components/shop/order-result";

export default function Page() {
  return (
    <Suspense>
      <OrderResult
        tone="error"
        title="Pagamento não aprovado"
        description="Houve um problema com o pagamento. Você pode tentar novamente ou usar outro método."
      />
    </Suspense>
  );
}
