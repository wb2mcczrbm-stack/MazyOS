import Image from "next/image";
import { linkGeral } from "@/lib/whatsapp";
import { IconeWhatsApp } from "./Icones";

/**
 * Header enxuto: logo oficial à esquerda, âncoras (somem no mobile) e o CTA
 * sempre visível. O botão é o único vermelho do topo — âncora da ação.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-tinta/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1060px] items-center justify-between px-6 py-4">
        <a href="#topo" aria-label="Wave Sound — início" className="flex items-center">
          {/* Barra escura → logo na versão pra fundo escuro (letreiro branco). */}
          <Image
            src="/logo-branco.png"
            alt="Wave Sound"
            width={168}
            height={28}
            priority
            className="h-7 w-auto"
          />
        </a>

        <nav className="hidden items-center gap-8 text-[15px] md:flex">
          <a href="#pacotes" className="text-white/70 transition-colors hover:text-white">
            Pacotes
          </a>
          <a href="#como-funciona" className="text-white/70 transition-colors hover:text-white">
            Como funciona
          </a>
          <a href="#agenda" className="text-white/70 transition-colors hover:text-white">
            Agenda
          </a>
          <a href="#trabalho" className="text-white/70 transition-colors hover:text-white">
            Nosso trabalho
          </a>
        </nav>

        <a
          href={linkGeral()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-[10px] bg-vermelho px-4 py-2.5 text-[15px] font-semibold text-white transition-[background-color] hover:bg-vermelho-escuro"
        >
          <IconeWhatsApp className="h-[18px] w-[18px]" />
          <span className="hidden sm:inline">Pedir orçamento</span>
          <span className="sm:hidden">Orçamento</span>
        </a>
      </div>
    </header>
  );
}
