import { LegalPage } from "@/components/ui/legal-page";

export const metadata = { title: "Termos de uso" };

export default function TermosPage() {
  return (
    <LegalPage
      title="Termos de uso"
      sections={[
        {
          heading: "Cadastro",
          body: "Ao criar uma conta, você declara que as informações fornecidas são verdadeiras e se compromete a mantê-las atualizadas.",
        },
        {
          heading: "Compras",
          body: "Todos os preços são exibidos em reais (BRL) e podem ser alterados sem aviso prévio. O valor cobrado é sempre recalculado no servidor no momento da confirmação do pedido.",
        },
        {
          heading: "Estoque",
          body: "A disponibilidade de produtos e variantes está sujeita a confirmação no momento da compra.",
        },
        {
          heading: "Propriedade intelectual",
          body: "Marca, logotipo e identidade visual Furikai são de uso exclusivo do clube e não podem ser reproduzidos sem autorização.",
        },
      ]}
    />
  );
}
