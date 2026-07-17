import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SITE, pracaFrase } from "@/lib/site";
import "./globals.css";

const url = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Uma família só: sans limpa e humana. Títulos pesam pelo weight/tracking, não
// por outra fonte. Nada de monoespaçada (foi o "console" que o cliente dispensou).
const inter = Inter({
  subsets: ["latin"],
  variable: "--fonte-corpo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: {
    // O bairro entra no título: contra "São Paulo" a Wave perde pros grandes;
    // na Anália Franco e região, ganha. Mesmo aprendizado da Ultra Scooter.
    default: `Wave Sound — sonorização de eventos ${pracaFrase()}`,
    template: "%s | Wave Sound",
  },
  description: SITE.descricao,
  keywords: [
    "sonorização de eventos",
    "som para casamento",
    "sonorização São Paulo",
    "som para festa Anália Franco",
    "aluguel de som para eventos",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: SITE.nome,
    title: `${SITE.nome} — sonorização de eventos`,
    description: SITE.descricao,
    // Capa dos links compartilhados (WhatsApp, Instagram DM). Sem isso o link
    // chega "pelado"; com isso, vira anúncio.
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="bg-papel font-sans text-tinta">
        {/* Sem JS, o reveal não dispara — força tudo visível pra não sumir conteúdo. */}
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        {children}
        {/* Vercel Web Analytics: visitas e origens, sem cookie. Ativar no painel
            da Vercel (aba Analytics → Enable) depois do deploy. */}
        <Analytics />
      </body>
    </html>
  );
}
