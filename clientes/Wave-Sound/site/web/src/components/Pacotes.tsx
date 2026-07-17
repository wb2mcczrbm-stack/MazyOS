import { PACOTES } from "@/lib/site";
import { linkPacote } from "@/lib/whatsapp";
import { IconeWhatsApp } from "./Icones";

/**
 * Os 4 pacotes. Preço "a partir de" (âncora), e cada card leva ao WhatsApp já
 * com o pacote no texto — o fechamento fino é lá. O "Profissional" ganha o selo
 * "Mais pedido" e a borda vermelha; nada de cor extra nos outros.
 */
export function Pacotes() {
  return (
    <section id="pacotes" className="bg-nevoa py-20">
      <div className="mx-auto max-w-[1060px] px-6">
        <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-vermelho">
          Pacotes
        </p>
        <h2 className="mb-3 text-[clamp(26px,3.6vw,36px)] font-bold tracking-[-0.02em]">
          Um ponto de partida claro
        </h2>
        <p className="mb-10 max-w-[52ch] text-[17px] text-cinza">
          Cada evento é único — o valor final depende do local, da duração e da estrutura.
          Os pacotes são o começo da conversa; o ajuste fino a gente fecha no WhatsApp.
        </p>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PACOTES.map((p) => (
            <div
              key={p.nome}
              className={`relative flex flex-col rounded-2xl border bg-papel p-6 ${
                p.destaque ? "border-vermelho shadow-[0_1px_0_var(--color-vermelho)]" : "border-borda"
              }`}
            >
              {p.destaque && (
                <span className="absolute -top-3 left-6 rounded-full bg-vermelho px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-white">
                  Mais pedido
                </span>
              )}

              {/* Título + linha crescem pra ocupar a mesma altura; assim o preço
                  e o botão ficam ancorados no rodapé e alinhados entre os cards,
                  mesmo quando um nome quebra em duas linhas. */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{p.nome}</h3>
                <p className="mt-1 text-sm text-cinza">{p.linha}</p>
              </div>

              <div className="mt-auto pt-6">
                <span className="block text-xs uppercase tracking-[0.08em] text-cinza">
                  a partir de
                </span>
                <span className="text-3xl font-bold tracking-[-0.02em]">R$ {p.preco}</span>
              </div>

              <a
                href={linkPacote(p.nome)}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-4 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                  p.destaque
                    ? "bg-vermelho text-white hover:bg-vermelho-escuro"
                    : "border border-borda text-tinta hover:border-cinza"
                }`}
              >
                <IconeWhatsApp className="h-[18px] w-[18px]" />
                Verificar data
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
