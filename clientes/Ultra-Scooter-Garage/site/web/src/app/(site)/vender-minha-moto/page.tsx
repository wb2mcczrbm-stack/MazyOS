"use client";

import { useState } from "react";
import { enviarLead } from "./actions";
import { linkGeral } from "@/lib/whatsapp";
import { IconeWhatsApp } from "@/components/Icones";

export default function VenderPage() {
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function submeter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);

    const r = await enviarLead(new FormData(e.currentTarget));
    if (r.erro) {
      setErro(r.erro);
      setEnviando(false);
      return;
    }
    setEnviado(true);
  }

  const campo =
    "w-full rounded-lg border border-cafe-borda bg-cafe-claro px-4 py-3 text-base text-creme placeholder:text-creme/35 focus:border-creme/60 focus:outline-none";
  const rotulo = "mb-1.5 block text-sm font-medium text-creme/80";

  if (enviado) {
    return (
      <div className="mx-auto max-w-md px-4 py-28 text-center">
        <h1 className="font-serif text-3xl">Recebemos.</h1>
        <p className="mt-4 text-creme/70">
          A gente dá uma olhada e retorna. Se quiser adiantar, chama no WhatsApp que
          a conversa começa agora.
        </p>
        <a
          href={linkGeral("Olá! Mandei minha scooter no formulário do site pra avaliação.")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block rounded-xl bg-zap px-6 py-3.5 font-semibold text-white transition hover:brightness-110"
        >
          <span className="flex items-center gap-2"><IconeWhatsApp className="h-5 w-5" />Falar no WhatsApp</span>
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-serif text-4xl leading-tight">Quer vender a sua scooter?</h1>
      <p className="mt-4 text-creme/70">
        A gente compra. Manda os dados que avaliamos e voltamos com uma proposta —
        sem compromisso e sem enrolação.
      </p>

      <form onSubmit={submeter} className="mt-10 space-y-5">
        <div>
          <label className={rotulo} htmlFor="nome">Seu nome</label>
          <input id="nome" name="nome" required className={campo} />
        </div>

        <div>
          <label className={rotulo} htmlFor="telefone">WhatsApp</label>
          <input
            id="telefone"
            name="telefone"
            type="tel"
            inputMode="tel"
            required
            placeholder="(11) 99999-8888"
            className={campo}
          />
        </div>

        <div>
          <label className={rotulo} htmlFor="moto_desc">Qual é a scooter?</label>
          <input
            id="moto_desc"
            name="moto_desc"
            required
            placeholder="Yamaha NMAX 160 2022, 12 mil km"
            className={campo}
          />
        </div>

        <div>
          <label className={rotulo} htmlFor="mensagem">
            Algo mais que a gente deva saber?{" "}
            <span className="text-creme/40">(opcional)</span>
          </label>
          <textarea
            id="mensagem"
            name="mensagem"
            rows={4}
            placeholder="Revisões em dia, único dono, pequeno risco no escapamento…"
            className={campo}
          />
        </div>

        {erro && <p className="text-sm text-red-400">{erro}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-xl bg-creme px-6 py-4 font-semibold text-cafe transition hover:brightness-95 disabled:opacity-50"
        >
          {enviando ? "Enviando…" : "Enviar pra avaliação"}
        </button>

        {/* Sem prometer prazo nem valor: a loja não pode garantir nenhum dos dois
            antes de ver a moto, e prometer o que não se sustenta é exatamente a
            falsa promessa que o _memoria/preferencias.md manda evitar. */}
        <p className="text-center text-xs leading-relaxed text-creme/40">
          A avaliação depende de ver a scooter pessoalmente. O que sai daqui é um
          primeiro contato, não uma oferta fechada.
        </p>
      </form>
    </div>
  );
}
