import { LegalPage } from "@/components/ui/legal-page";

export const metadata = { title: "Política de troca" };

export default function TrocasPage() {
  return (
    <LegalPage
      title="Política de troca"
      sections={[
        {
          heading: "Prazo",
          body: "Você pode solicitar troca em até 30 dias corridos após a entrega do pedido, diretamente pela sua área do cliente.",
        },
        {
          heading: "Condições do produto",
          body: "A peça deve estar sem uso, com etiquetas originais e embalagem preservada.",
        },
        {
          heading: "Como solicitar",
          body: "Acesse Minha conta > Pedidos, selecione o pedido entregue e clique em 'Solicitar troca', informando o motivo.",
        },
        {
          heading: "Frete de devolução",
          body: "Nos casos de defeito de fabricação, o frete de devolução é por conta da Furikai. Nos demais casos, o custo é do cliente.",
        },
      ]}
    />
  );
}
