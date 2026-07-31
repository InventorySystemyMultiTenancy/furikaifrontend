import Link from "next/link";

export const metadata = { title: "Suporte" };

const FAQ = [
  { q: "Qual o prazo de entrega?", a: "PAC: 3 a 12 dias úteis. SEDEX: 1 a 5 dias úteis, dependendo da região." },
  { q: "Como funciona a troca?", a: "Pedidos entregues podem solicitar troca em até 30 dias direto pela área do cliente." },
  { q: "Quais formas de pagamento vocês aceitam?", a: "Pix, cartão de crédito (em até 3x sem juros) e boleto, via Mercado Pago." },
  { q: "Como acompanho meu pedido?", a: "Pela área do cliente ou pela página de rastreio, usando o número do pedido e o e-mail da compra." },
];

export default function SuportePage() {
  return (
    <div className="pt-32 pb-24 px-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl tracking-wide mb-2 text-center">Suporte</h1>
        <p className="text-furikai-gray-400 text-center mb-12">Estamos aqui para ajudar.</p>

        <div className="grid grid-cols-2 gap-4 mb-14 text-center text-sm">
          <a href="mailto:contato@furikai.com.br" className="border border-furikai-gray-700 p-5 hover:border-furikai-white">
            contato@furikai.com.br
          </a>
          <a href="https://wa.me/5511999999999" className="border border-furikai-gray-700 p-5 hover:border-furikai-white">
            WhatsApp
          </a>
        </div>

        <div className="space-y-6 mb-14">
          {FAQ.map((f) => (
            <div key={f.q} className="border-b border-white/10 pb-4">
              <p className="text-furikai-white mb-1">{f.q}</p>
              <p className="text-sm text-furikai-gray-400">{f.a}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 justify-center text-sm">
          <Link href="/suporte/rastreio" className="underline text-furikai-gray-300 hover:text-furikai-white">
            Rastrear pedido
          </Link>
          <Link href="/suporte/trocas" className="underline text-furikai-gray-300 hover:text-furikai-white">
            Política de troca
          </Link>
          <Link href="/suporte/privacidade" className="underline text-furikai-gray-300 hover:text-furikai-white">
            Política de privacidade
          </Link>
          <Link href="/suporte/termos" className="underline text-furikai-gray-300 hover:text-furikai-white">
            Termos de uso
          </Link>
        </div>
      </div>
    </div>
  );
}
