import Image from "next/image";
import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/publico";
import { MotoCard } from "@/components/MotoCard";
import { IconeWhatsApp } from "@/components/Icones";
import { linkGeral } from "@/lib/whatsapp";
import {
  LOJA,
  HORARIO,
  pracaFrase,
  enderecoCompleto,
  mapaEmbedSrc,
  linkComoChegar,
} from "@/lib/loja";
import { STATUS_VISIVEIS, type MotoComFotos } from "@/lib/types";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = createPublicClient();

  const { data } = await supabase
    .from("motos")
    .select("*, fotos(*)")
    .is("apagada_em", null)
    .in("status", STATUS_VISIVEIS)
    .order("destaque", { ascending: false })
    .order("criado_em", { ascending: false })
    .limit(6);

  const motos = (data ?? []) as MotoComFotos[];
  motos.forEach((m) => m.fotos.sort((a, b) => a.ordem - b.ordem));

  return (
    <>
      {/* Faixa 1 — hero com a fachada da loja de fundo. O degradê escurece mais
          à esquerda (onde o texto senta) e alivia à direita (onde o letreiro da
          fachada aparece). */}
      <section className="relative overflow-hidden">
        <Image
          src="/fachada-esquina4.jpg"
          alt=""
          fill
          priority
          className="object-cover object-[center_30%]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-preto/95 via-preto/80 to-preto/55" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32">
          {/* O h1 é o sinal de SEO mais forte da home — e por isso ele carrega o
              bairro. Contra "São Paulo" a loja perde pra Webmotors; no Tatuapé, não. */}
          <h1 className="max-w-3xl font-serif text-4xl leading-[1.15] sm:text-6xl">
            Scooters usadas {pracaFrase()}.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-creme/70">
            Estoque real, fotos reais, preço na tela. Sem cadastro pra ver o valor e
            sem enrolação pra fechar.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/motos"
              className="rounded-xl bg-creme px-7 py-3.5 font-semibold text-cafe transition hover:brightness-95"
            >
              Ver o estoque
            </Link>
            <a
              href={linkGeral()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-cafe-borda px-7 py-3.5 font-semibold transition hover:border-creme/60"
            >
              <IconeWhatsApp className="h-5 w-5" />
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Faixa 2 — estoque, na tonalidade mais escura pra os cards saltarem. */}
      <section className="bg-cafe-fundo">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <div className="flex items-end justify-between border-b border-cafe-borda pb-4">
            <h2 className="wordmark text-sm text-creme/70">Nosso estoque</h2>
            <Link href="/motos" className="text-sm text-creme/70 transition hover:text-creme">
              Ver todas →
            </Link>
          </div>

          {motos.length === 0 ? (
            <p className="mt-10 rounded-xl border border-dashed border-cafe-borda p-12 text-center text-creme/50">
              Estoque ainda não cadastrado. Assim que a loja subir as scooters pelo
              painel, elas aparecem aqui.
            </p>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {motos.map((m) => (
                <MotoCard key={m.id} moto={m} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Faixa 3 — motivos, faixa clara pra alternar com o estoque escuro. */}
      <section className="border-t border-cafe-borda bg-cafe-claro">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:grid-cols-3">
          <div>
            <h3 className="font-serif text-xl">Compramos a sua também</h3>
            <p className="mt-2 text-sm leading-relaxed text-creme/60">
              Não é só venda. Se quiser trocar ou vender a sua scooter, a gente
              avalia e faz proposta.
            </p>
            <Link
              href="/vender-minha-moto"
              className="mt-4 inline-block text-sm font-semibold underline underline-offset-4"
            >
              Quero vender a minha
            </Link>
          </div>

          <div>
            <h3 className="font-serif text-xl">Loja física {pracaFrase()}</h3>
            <p className="mt-2 text-sm leading-relaxed text-creme/60">
              Você vem, olha a scooter, liga o motor e decide com ela na sua frente.
            </p>
          </div>

          <div>
            <h3 className="font-serif text-xl">Sem promessa que não se cumpre</h3>
            <p className="mt-2 text-sm leading-relaxed text-creme/60">
              O que está no anúncio é o que está no pátio. Se a scooter tem um
              detalhe, a gente conta antes de você atravessar a cidade.
            </p>
          </div>
        </div>
      </section>

      {/* Faixa 5 — onde estamos, faixa escura pro mapa saltar. Loja de bairro vende
          pela proximidade: mostrar o ponto exato reduz o atrito de "será que é perto?". */}
      <section className="border-t border-cafe-borda bg-cafe-fundo" id="onde-estamos">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="wordmark text-sm text-creme/70">Onde estamos</h2>

          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_1.5fr]">
            <div>
              <p className="font-serif text-2xl">{LOJA.nome}</p>
              <p className="mt-3 leading-relaxed text-creme/70">{enderecoCompleto()}</p>

              <div className="mt-6 border-t border-cafe-borda pt-6">
                <p className="wordmark text-xs text-creme/50">Horário</p>
                <dl className="mt-3 space-y-1.5 text-sm">
                  {HORARIO.map((h) => (
                    <div key={h.dias} className="flex justify-between gap-4">
                      <dt className="text-creme/60">{h.dias}</dt>
                      <dd className="font-medium">{h.horas}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={linkComoChegar()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-creme px-6 py-3 font-semibold text-cafe transition hover:brightness-95"
                >
                  Como chegar
                </a>
                <a
                  href={LOJA.google}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-cafe-borda px-6 py-3 font-semibold transition hover:border-creme/60"
                >
                  Ver no Google
                </a>
              </div>
            </div>

            {/* Só o mapa aqui: a fachada da esquina já é o fundo do hero, e repetir
                a mesma foto na página ficava redundante. */}
            <div className="overflow-hidden rounded-xl border border-cafe-borda">
              <iframe
                title={`Mapa da ${LOJA.nome}`}
                src={mapaEmbedSrc()}
                className="block h-[420px] w-full"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>

          {/* A frente da loja, com o pátio cheio — prova de que a loja é real. */}
          <div className="mt-8 overflow-hidden rounded-xl border border-cafe-borda">
            <Image
              src="/fachada-frente3.jpg"
              alt={`Frente da ${LOJA.nome} com as scooters no pátio`}
              width={2200}
              height={1650}
              className="max-h-[440px] w-full object-cover object-center"
              sizes="100vw"
            />
          </div>
        </div>
      </section>
    </>
  );
}
