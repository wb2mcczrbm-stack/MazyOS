import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Pacotes } from "@/components/Pacotes";
import { ComoFunciona } from "@/components/ComoFunciona";
import { Agenda } from "@/components/Agenda";
import { Trabalho } from "@/components/Trabalho";
import { Fechamento } from "@/components/Fechamento";
import { Rodape } from "@/components/Rodape";
import { DadosEstruturados } from "@/components/DadosEstruturados";
import { Reveal } from "@/components/Reveal";

/**
 * Site de página única, na ordem que vende confiança:
 * hero → pacotes (âncora de preço) → como funciona (tira o medo) →
 * trabalho (prova social via Instagram) → fechamento (CTA) → rodapé (contato).
 */
export default function Home() {
  return (
    <>
      <DadosEstruturados />
      <Header />
      <main>
        <Hero />
        <Reveal>
          <Pacotes />
        </Reveal>
        <Reveal>
          <ComoFunciona />
        </Reveal>
        <Reveal>
          <Agenda />
        </Reveal>
        <Reveal>
          <Trabalho />
        </Reveal>
        <Reveal>
          <Fechamento />
        </Reveal>
      </main>
      <Rodape />
    </>
  );
}
