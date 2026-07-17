import Image from "next/image";
import { SITE } from "@/lib/site";
import { IconeInstagram } from "./Icones";

/**
 * Portfólio = carrossel de posts reais do @wave.snd ("posts passando").
 *
 * REGRA DO BRIEFING: só post REAL do Instagram deles — nada de "evento da Wave"
 * que não aconteceu. Confiança é o produto.
 *
 * COMO POPULAR (decisão do cliente: curadoria manual, sem widget/token):
 *  1. Salve a imagem de cada post que quiser destacar em `public/trabalho/`.
 *  2. Adicione uma linha em POSTS com o arquivo, o link do post e um alt honesto.
 *  3. Pronto — o carrossel liga sozinho. Enquanto a lista estiver vazia, a seção
 *     mostra o convite pro Instagram (fallback), sem inventar conteúdo.
 *
 * Ex.: { img: "/trabalho/casamento-anita.jpg",
 *        url: "https://www.instagram.com/p/XXXXXXXXX/",
 *        alt: "Sonorização de casamento no salão — pista cheia" }
 */
type Post = { img: string; url: string; alt: string };

const POSTS: Post[] = [
  // Aguardando os posts reais do @wave.snd. Assim que chegarem, entram aqui.
];

export function Trabalho() {
  const temPosts = POSTS.length > 0;
  // Trilha duplicada: a animação anda -50% e emenda sem corte visível.
  const trilha = temPosts ? [...POSTS, ...POSTS] : [];

  return (
    <section id="trabalho" className="overflow-hidden bg-papel py-20">
      <div className="mx-auto max-w-[1060px] px-6">
        <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-vermelho">
          Nosso trabalho
        </p>
        <h2 className="mb-3 max-w-[24ch] text-[clamp(26px,3.6vw,36px)] font-bold tracking-[-0.02em]">
          Cada evento vira um post
        </h2>
        <p className="mb-10 max-w-[54ch] text-[17px] text-cinza">
          A gente registra os eventos e publica no Instagram — é o nosso portfólio vivo.
        </p>
      </div>

      {temPosts ? (
        <>
          {/* full-bleed de propósito: os posts "passam" de ponta a ponta da tela */}
          <div className="marquee">
            <div className="marquee-trilha px-6">
              {trilha.map((p, i) => (
                <a
                  key={`${p.url}-${i}`}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-hidden={i >= POSTS.length}
                  tabIndex={i >= POSTS.length ? -1 : undefined}
                  className="group relative block aspect-[4/5] w-[220px] shrink-0 overflow-hidden rounded-xl border border-borda bg-papel"
                >
                  <Image
                    src={p.img}
                    alt={p.alt}
                    fill
                    sizes="220px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <span className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm">
                    <IconeInstagram className="h-4 w-4" />
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-[1060px] px-6">
            <a
              href={SITE.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-borda bg-papel px-5 py-3 text-sm font-semibold text-tinta transition-colors hover:border-cinza"
            >
              <IconeInstagram className="h-[18px] w-[18px] text-vermelho" />
              Ver tudo no Instagram
            </a>
          </div>
        </>
      ) : (
        <div className="mx-auto max-w-[1060px] px-6">
          <a
            href={SITE.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-borda bg-papel px-6 py-14 text-center transition-colors hover:border-cinza"
          >
            <IconeInstagram className="h-9 w-9 text-vermelho" />
            <span className="text-lg font-semibold">@{SITE.instagram}</span>
            <span className="max-w-[36ch] text-[15px] text-cinza">
              Veja os últimos eventos, os bastidores e o equipamento no nosso Instagram.
            </span>
          </a>
        </div>
      )}
    </section>
  );
}
