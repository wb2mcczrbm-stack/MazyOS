import { linkGeral } from "@/lib/whatsapp";
import { SITE, pracaFrase } from "@/lib/site";
import { IconeWhatsApp } from "./Icones";

/**
 * Faixa final: uma frase curta de confiança e o último empurrão pro WhatsApp.
 * Fundo vermelho — o único bloco de cor cheia do site, reservado pro momento da
 * decisão. Confiança é o produto (ver CLAUDE.md do projeto).
 */
export function Fechamento() {
  return (
    <section className="bg-vermelho py-20 text-white">
      <div className="mx-auto max-w-[1060px] px-6 text-center">
        <h2 className="mx-auto max-w-[22ch] text-[clamp(28px,4vw,42px)] font-bold leading-tight tracking-[-0.02em]">
          Seu evento merece um som em que dá pra confiar
        </h2>
        <p className="mx-auto mt-4 max-w-[46ch] text-[17px] text-white/85">
          Atendemos {pracaFrase()}. Manda a data no WhatsApp e a gente verifica a
          disponibilidade — sem compromisso.
        </p>
        <a
          href={linkGeral()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2.5 rounded-xl bg-white px-8 py-4 font-semibold text-vermelho transition-transform hover:scale-[1.02]"
        >
          <IconeWhatsApp />
          Falar com a {SITE.nome}
        </a>
      </div>
    </section>
  );
}
