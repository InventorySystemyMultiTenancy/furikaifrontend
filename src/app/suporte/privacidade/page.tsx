import { LegalPage } from "@/components/ui/legal-page";

export const metadata = { title: "Política de privacidade" };

export default function PrivacidadePage() {
  return (
    <LegalPage
      title="Política de privacidade"
      sections={[
        {
          heading: "Dados coletados",
          body: "Coletamos nome, e-mail, telefone, endereços de entrega e histórico de pedidos para viabilizar suas compras.",
        },
        {
          heading: "Pagamentos",
          body: "Os dados de pagamento são processados diretamente pelo Mercado Pago. A Furikai não armazena números de cartão de crédito.",
        },
        {
          heading: "Uso dos dados",
          body: "Usamos seus dados para processar pedidos, calcular frete, enviar atualizações de status e, mediante consentimento, comunicações de marketing.",
        },
        {
          heading: "Seus direitos",
          body: "Você pode editar seus dados, baixar comprovantes de pedidos e solicitar a exclusão da sua conta a qualquer momento pela área do cliente.",
        },
      ]}
    />
  );
}
