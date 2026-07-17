import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createPublicClient, fotoUrl } from "@/lib/supabase/publico";
import { Galeria } from "@/components/Galeria";
import { IconeWhatsApp } from "@/components/Icones";
import { linkMoto } from "@/lib/whatsapp";
import { LOJA, praca, pracaFrase } from "@/lib/loja";
import { anos, km as fmtKm, parcela, preco, titulo } from "@/lib/format";
import type { MotoComFotos } from "@/lib/types";

export const revalidate = 60;

async function buscar(slug: string) {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("motos")
    .select("*, fotos(*)")
    .eq("slug", slug)
    .is("apagada_em", null)
    .single();

  if (!data) return null;
  const moto = data as MotoComFotos;
  moto.fotos.sort((a, b) => a.ordem - b.ordem);
  return moto;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const moto = await buscar(slug);
  if (!moto) return { title: "Moto não encontrada" };

  /*
   * O título é a jogada de SEO inteira.
   *
   * "Honda CB 500F 2022 usada em São Paulo" perde pra Webmotors e Mercado Livre —
   * é a praça mais disputada do país. "…usada no <bairro>" ganha, porque ninguém
   * atravessa São Paulo pra ver uma moto e o marketplace rankeia mal na cauda
   * longa por bairro. Enquanto LOJA.bairro estiver vazio, isso cai pra "São Paulo"
   * e a página entra numa briga que não dá pra vencer.
   */
  const t = `${titulo(moto)} usada ${pracaFrase()} — ${preco(moto.preco)}`;
  const capa = moto.fotos[0];

  return {
    title: t,
    description:
      moto.descricao?.slice(0, 155) ??
      `${titulo(moto)} com ${fmtKm(moto.km)}. Ultra Scooter Garage, ${praca()}.`,
    openGraph: { title: t, images: capa ? [fotoUrl(capa.path)] : [] },
  };
}

export default async function FichaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const moto = await buscar(slug);
  if (!moto) notFound();

  const p = parcela(moto.preco);
  const vendida = moto.status === "VENDIDA";

  // Moto vendida NÃO some da web: a página continua rankeando e vira prova social.
  // Sai da vitrine, permanece indexada.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: titulo(moto),
    description: moto.descricao ?? undefined,
    image: moto.fotos.map((f) => fotoUrl(f.path)),
    brand: { "@type": "Brand", name: moto.marca },
    mileageFromOdometer: { "@type": "QuantitativeValue", value: moto.km, unitCode: "KMT" },
    offers: {
      "@type": "Offer",
      price: moto.preco,
      priceCurrency: "BRL",
      availability: vendida ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/UsedCondition",
      seller: { "@type": "AutoDealer", name: LOJA.nome },
    },
  };

  // A placa (mesmo o dígito final) NÃO vai pro site — dado interno, fica só no painel.
  const specs: [string, string][] = [
    ["Ano", anos(moto)],
    ["Quilometragem", fmtKm(moto.km)],
    ...(moto.cilindrada ? ([["Cilindrada", `${moto.cilindrada} cc`]] as [string, string][]) : []),
    ...(moto.cor ? ([["Cor", moto.cor]] as [string, string][]) : []),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        <Galeria fotos={moto.fotos} alt={titulo(moto)} />

        <div>
          <h1 className="font-serif text-3xl leading-tight sm:text-4xl">
            {moto.marca} {moto.modelo}
          </h1>
          <p className="mt-2 text-creme/60">
            {anos(moto)} · {fmtKm(moto.km)}
          </p>

          {vendida ? (
            <div className="mt-8 rounded-xl border border-cafe-borda bg-cafe-claro p-5">
              <p className="font-semibold">Esta scooter já foi vendida.</p>
              <p className="mt-1.5 text-sm text-creme/60">
                Temos outras parecidas no pátio — chame no WhatsApp que a gente acha
                a sua.
              </p>
            </div>
          ) : (
            <>
              <p className="mt-8 text-4xl font-semibold">{preco(moto.preco)}</p>
              <p className="mt-1.5 text-sm text-creme/55">
                ou entrada de {preco(p.entrada)} + {p.meses}x de {preco(p.valor)}*
              </p>
            </>
          )}

          {/* O CTA do site inteiro. Disponível → WhatsApp com a mensagem já
              preenchida. Vendida → leva pro estoque: quem clica em "parecidas"
              quer ver scooters, não abrir uma conversa. */}
          {vendida ? (
            <Link
              href="/motos"
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-creme px-6 py-4 text-base font-semibold text-cafe transition hover:brightness-95"
            >
              Ver scooters parecidas
            </Link>
          ) : (
            <a
              href={linkMoto(moto)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-zap px-6 py-4 text-base font-semibold text-white transition hover:brightness-110"
            >
              <IconeWhatsApp className="h-5 w-5" />
              Falar com a loja no WhatsApp
            </a>
          )}

          <dl className="mt-10 divide-y divide-cafe-borda border-y border-cafe-borda">
            {specs.map(([k, v]) => (
              <div key={k} className="flex justify-between py-3.5 text-sm">
                <dt className="text-creme/55">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {moto.descricao && (
        <div className="mt-16 max-w-3xl">
          <h2 className="wordmark text-sm text-creme/70">Sobre esta scooter</h2>
          <p className="mt-4 whitespace-pre-line leading-relaxed text-creme/80">
            {moto.descricao}
          </p>
        </div>
      )}

      {!vendida && (
        <p className="mt-12 text-xs leading-relaxed text-creme/35">
          * Simulação com 20% de entrada e taxa estimada de 1,99% a.m. Não é proposta
          de crédito — sujeito a análise e às condições da financeira.
        </p>
      )}
    </div>
  );
}
