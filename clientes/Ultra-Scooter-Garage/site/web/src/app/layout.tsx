import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { LOJA, pracaFrase } from "@/lib/loja";
import "./globals.css";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Serifada de alto contraste — é o que mais se aproxima do wordmark do logo.
const titulo = Playfair_Display({
  subsets: ["latin"],
  variable: "--fonte-titulo",
  display: "swap",
});

// Preço, km, ano e formulário precisam de legibilidade, não de personalidade.
const corpo = Inter({
  subsets: ["latin"],
  variable: "--fonte-corpo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    // O bairro entra no título padrão porque é ele que ganha a busca. Contra
    // "São Paulo" a loja perde pra Webmotors e Mercado Livre; no Tatuapé, não.
    default: `Ultra Scooter Garage — scooters usadas ${pracaFrase()}`,
    template: "%s | Ultra Scooter Garage",
  },
  description:
    `Scooters usadas com procedência ${pracaFrase()}, ${LOJA.cidade}. ` +
    "Estoque atualizado, fotos reais, atendimento direto no WhatsApp.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: LOJA.nome,
    // Capa dos links compartilhados (WhatsApp, Instagram DM): a fachada com o
    // letreiro. Sem isso o link chega "pelado" no grupo — com isso, vira anúncio.
    images: [{ url: "/fachada-esquina4.jpg", width: 2000, height: 1500 }],
  },
};

/**
 * Root só monta html/body e carrega as fontes.
 *
 * O shell visual mora nos layouts filhos, e eles são deliberadamente diferentes:
 * `(site)` é a vitrine (escura, marca); `admin` é ferramenta (clara, legível na
 * luz do sol da loja). Ver identidade/design-guide.md.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${titulo.variable} ${corpo.variable}`}>
      <body className="font-sans">
        {children}
        {/* Vercel Web Analytics: visitas e origens, sem cookie. Ativa de vez no
            painel da Vercel (aba Analytics → Enable). */}
        <Analytics />
      </body>
    </html>
  );
}
