import Image from "next/image";
import { SITE } from "@/lib/site";
import { linkGeral } from "@/lib/whatsapp";
import { IconeWhatsApp, IconeInstagram } from "./Icones";

/**
 * Rodapé: contato, endereço (Anália Franco — peso de SEO local) e redes.
 * Fundo escuro (o único do site) pra fechar a página com contraste, usando a
 * versão do logo pra fundo escuro.
 */
export function Rodape() {
  const { endereco } = SITE;
  const mapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${endereco.rua}, ${endereco.bairro}, ${endereco.cidade} - ${endereco.uf}`,
  )}`;

  return (
    <footer className="bg-tinta py-14 text-white">
      <div className="mx-auto grid max-w-[1060px] gap-10 px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Image
            src="/logo-branco.png"
            alt="Wave Sound"
            width={168}
            height={28}
            className="h-7 w-auto"
          />
          <p className="mt-4 max-w-[34ch] text-[15px] leading-relaxed text-white/60">
            Sonorização profissional para casamentos, shows e conferências em São Paulo.
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href={linkGeral()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            >
              <IconeWhatsApp className="h-5 w-5" />
            </a>
            <a
              href={SITE.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            >
              <IconeInstagram className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="text-[15px]">
          <h3 className="mb-3 font-semibold">Contato</h3>
          <ul className="space-y-2 text-white/60">
            <li>
              <a href={linkGeral()} className="transition-colors hover:text-white">
                {SITE.telefone}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="transition-colors hover:text-white">
                {SITE.email}
              </a>
            </li>
            <li>
              <a
                href={SITE.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                @{SITE.instagram}
              </a>
            </li>
          </ul>
        </div>

        <div className="text-[15px]">
          <h3 className="mb-3 font-semibold">Onde estamos</h3>
          <a
            href={mapa}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 transition-colors hover:text-white"
          >
            {endereco.rua}
            <br />
            {endereco.bairro}
            <br />
            {endereco.cidade} — {endereco.uf}
            <br />
            {endereco.cep}
          </a>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-[1060px] border-t border-white/10 px-6 pt-6 text-[13px] text-white/40">
        © {SITE.nome} · Sonorização de eventos · São Paulo
      </div>
    </footer>
  );
}
