import { PACOTES } from "@/lib/site";
import { OndaSuave } from "./Icones";

/**
 * Hero: frase-âncora + a onda suave (uma vez, quase transparente) + CTA.
 * "do jeito certo" em vermelho é o único acento de cor no texto.
 */
export function Hero() {
  const menorPreco = PACOTES[0].preco;

  return (
    <section id="topo" className="relative overflow-hidden">
      {/* A onda: eco do logo, decorativa, atrás do texto. Some no mobile. */}
      <OndaSuave className="pointer-events-none absolute -right-36 top-16 hidden w-[620px] opacity-[0.10] md:block" />

      <div className="mx-auto max-w-[1060px] px-6 pb-24 pt-24 md:pt-28">
        <span className="inline-block rounded-full border border-borda px-3.5 py-1.5 text-xs uppercase tracking-[0.08em] text-cinza">
          Sonorização de eventos · São Paulo
        </span>

        <h1 className="mt-6 max-w-[17ch] text-[clamp(36px,5.8vw,62px)] font-bold leading-[1.06] tracking-[-0.022em]">
          O som do seu evento, <em className="not-italic text-vermelho">do jeito certo</em>.
        </h1>

        <p className="mt-6 max-w-[50ch] text-[19px] leading-relaxed text-cinza">
          Sonorização para casamentos, shows e conferências — equipamento profissional,
          instalação e suporte no dia, do primeiro teste ao último acorde.
        </p>

        <p className="mt-3 text-sm text-cinza">
          Pacotes <b className="text-tinta">a partir de R$ {menorPreco}</b>
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <a
            href="#agenda"
            className="flex items-center gap-2.5 rounded-xl bg-vermelho px-7 py-[15px] font-semibold text-white transition-[background-color] hover:bg-vermelho-escuro"
          >
            Verificar minha data
          </a>
          <a
            href="#pacotes"
            className="flex items-center rounded-xl border border-borda px-7 py-[15px] font-semibold text-tinta transition-colors hover:border-cinza"
          >
            Ver pacotes
          </a>
        </div>
      </div>
    </section>
  );
}
