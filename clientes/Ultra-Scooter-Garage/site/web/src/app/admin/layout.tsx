import Image from "next/image";
import Link from "next/link";

export const metadata = { title: "Painel", robots: { index: false, follow: false } };

/**
 * Casca de tudo em /admin, inclusive o login.
 *
 * Painel é FERRAMENTA, não vitrine — por isso é claro, e o site é escuro. O
 * vendedor usa isso no celular, em pé na loja, muitas vezes na luz do sol:
 * legibilidade ganha de coerência de marca. A marca entra só na faixa do topo.
 * Ver identidade/design-guide.md.
 *
 * A navegação do painel NÃO mora aqui — mora em (interno)/layout.tsx, senão a
 * tela de login mostraria "+ Nova moto" pra quem ainda nem entrou.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <div className="border-b-2 border-vermelho bg-preto">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Image
            src="/logo.png"
            alt="Ultra Scooter Garage"
            width={180}
            height={52}
            priority
            className="h-8 w-auto"
          />
          <Link href="/" className="text-xs text-creme/60 transition hover:text-creme">
            Ver o site ↗
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6">{children}</div>
    </div>
  );
}
