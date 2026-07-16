import Image from "next/image";
import Link from "next/link";
import { linkGeral } from "@/lib/whatsapp";
import { LOJA, enderecoCompleto, linkMapa } from "@/lib/loja";
import { IconeWhatsApp, IconeInstagram } from "@/components/Icones";

/**
 * Vitrine. Fundo escuro não é só fidelidade ao logo: foto de veículo destaca em
 * fundo escuro — é por isso que showroom e revista de carro usam preto. A
 * Webmotors é branca porque é marketplace genérico; a loja não precisa parecer
 * com ela. A moto é o produto, o site é a moldura.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  // AutoDealer + endereço estruturado: é assim que o Google entende que existe
  // uma loja física num bairro, e é o que sustenta o SEO local.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: LOJA.nome,
    address: {
      "@type": "PostalAddress",
      streetAddress: LOJA.rua,
      addressLocality: LOJA.bairro || LOJA.cidade,
      addressRegion: LOJA.uf,
      postalCode: LOJA.cep || undefined,
      addressCountry: "BR",
    },
    url: process.env.NEXT_PUBLIC_SITE_URL,
  };

  return (
    <div className="flex min-h-screen flex-col bg-cafe text-creme">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Barra preta com a linha vermelha da marca embaixo — igual à fachada. */}
      <header className="sticky top-0 z-40 border-b-2 border-vermelho bg-preto/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" aria-label="Ultra Scooter Garage — início">
            <Image
              src="/logo.png"
              alt="Ultra Scooter Garage"
              width={220}
              height={64}
              priority
              className="h-10 w-auto sm:h-12"
            />
          </Link>

          <nav className="flex items-center gap-5 text-sm sm:gap-7">
            <Link href="/motos" className="text-creme/70 transition hover:text-creme">
              Estoque
            </Link>
            <Link
              href="/vender-minha-moto"
              className="text-creme/70 transition hover:text-creme"
            >
              Vender a minha
            </Link>
            <a
              href={LOJA.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Seguir a loja no Instagram"
              className="text-creme/70 transition hover:text-creme"
            >
              <IconeInstagram className="h-5 w-5" />
            </a>
            <a
              href={linkGeral()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-lg bg-zap px-4 py-2 font-semibold text-white transition hover:brightness-110 sm:flex"
            >
              <IconeWhatsApp className="h-4 w-4" />
              WhatsApp
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-cafe-borda bg-cafe-claro">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <Image
            src="/logo-redondo.png"
            alt=""
            width={80}
            height={80}
            className="h-16 w-auto"
          />

          {/* "Falar com a gente" encostado no canto direito, alinhado à direita. */}
          <div className="mt-6 flex flex-col gap-6 text-sm text-creme/60 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-medium text-creme/90">Onde estamos</p>
              <a
                href={linkMapa()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block transition hover:text-creme"
              >
                {enderecoCompleto()}
              </a>
            </div>
            <div className="sm:text-right">
              <p className="font-medium text-creme/90">Falar com a gente</p>
              <a
                href={linkGeral()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 flex items-center gap-1.5 transition hover:text-creme sm:justify-end"
              >
                <IconeWhatsApp className="h-4 w-4" />
                WhatsApp
              </a>
              <a
                href={LOJA.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 flex items-center gap-1.5 transition hover:text-creme sm:justify-end"
              >
                <IconeInstagram className="h-4 w-4" />
                @ultrascootergarage
              </a>
            </div>
          </div>

          <p className="mt-10 text-xs text-creme/40">
            © {new Date().getFullYear()} Ultra Scooter Garage · Site por Romano &amp;
            Bettini
          </p>
        </div>
      </footer>
    </div>
  );
}
