/**
 * Três passos. Sonorização é serviço de risco percebido — o cliente precisa
 * enxergar que é simples e que tem gente responsável do outro lado. Sem isso o
 * preço na tela não fecha sozinho.
 */
const PASSOS = [
  {
    n: "01",
    titulo: "Você fala com a gente",
    texto:
      "Manda a data, o local e o tipo de evento no WhatsApp. A gente entende o que o seu dia precisa antes de falarmos em valor.",
  },
  {
    n: "02",
    titulo: "Montamos o orçamento",
    texto:
      "Você recebe uma proposta clara — equipamento, equipe e estrutura certos pro seu evento, sem surpresa depois.",
  },
  {
    n: "03",
    titulo: "O som acontece",
    texto:
      "Chegamos antes, testamos tudo e ficamos de plantão do primeiro convidado ao último acorde. Você cuida da festa; o som é com a gente.",
  },
];

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="py-20">
      <div className="mx-auto max-w-[1060px] px-6">
        <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-vermelho">
          Como funciona
        </p>
        <h2 className="mb-10 max-w-[20ch] text-[clamp(26px,3.6vw,36px)] font-bold tracking-[-0.02em]">
          Simples do primeiro contato ao fim do evento
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {PASSOS.map((p) => (
            <div key={p.n} className="border-t border-borda pt-6">
              <span className="text-2xl font-bold text-vermelho">{p.n}</span>
              <h3 className="mt-2 text-lg font-semibold">{p.titulo}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-cinza">{p.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
