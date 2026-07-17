"use client";

import { useEffect, useMemo, useState } from "react";
import { linkData } from "@/lib/whatsapp";
import { IconeWhatsApp } from "./Icones";

/**
 * Mini-calendário de disponibilidade (Nível A).
 *
 * Lê /api/disponibilidade (que consulta a agenda do Google, só livre/ocupado).
 * Datas ocupadas e passadas ficam bloqueadas; ao escolher uma data livre, o
 * cliente vai pro WhatsApp já com o dia preenchido — some a duplicidade de
 * reserva e a agenda da equipe vira a fonte única.
 *
 * Enquanto a agenda não está conectada, a API devolve "nada ocupado" e todas as
 * datas futuras aparecem livres — o site funciona igual.
 */

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];
const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

const MESES_A_FRENTE = 5; // navega do mês atual até +5

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function iso(ano: number, mes: number, dia: number) {
  return `${ano}-${pad(mes + 1)}-${pad(dia)}`;
}
function paraBR(isoStr: string) {
  const [a, m, d] = isoStr.split("-");
  return `${d}/${m}/${a}`;
}

export function Agenda() {
  const hoje = useMemo(() => new Date(), []);
  const anoHoje = hoje.getFullYear();
  const mesHoje = hoje.getMonth();
  const isoHoje = iso(anoHoje, mesHoje, hoje.getDate());

  const [offset, setOffset] = useState(0); // meses a partir do atual
  const [ocupadas, setOcupadas] = useState<Set<string>>(new Set());
  const [carregando, setCarregando] = useState(true);
  const [selecionada, setSelecionada] = useState<string | null>(null);

  // Mês exibido a partir do offset.
  const ano = anoHoje + Math.floor((mesHoje + offset) / 12);
  const mes = (mesHoje + offset) % 12;

  useEffect(() => {
    const inicio = new Date(anoHoje, mesHoje, 1);
    const fim = new Date(anoHoje, mesHoje + MESES_A_FRENTE + 1, 0);
    const q = `inicio=${iso(inicio.getFullYear(), inicio.getMonth(), inicio.getDate())}&fim=${iso(
      fim.getFullYear(),
      fim.getMonth(),
      fim.getDate(),
    )}`;

    let vivo = true;
    fetch(`/api/disponibilidade?${q}`)
      .then((r) => r.json())
      .then((d: { ocupadas?: string[] }) => {
        if (vivo) setOcupadas(new Set(d.ocupadas ?? []));
      })
      .catch(() => {
        /* degrada pra tudo livre */
      })
      .finally(() => {
        if (vivo) setCarregando(false);
      });
    return () => {
      vivo = false;
    };
  }, [anoHoje, mesHoje]);

  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const celulas: (number | null)[] = [
    ...Array(primeiroDiaSemana).fill(null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ];

  function estado(dia: number) {
    const d = iso(ano, mes, dia);
    if (d < isoHoje) return "passado" as const;
    if (ocupadas.has(d)) return "ocupado" as const;
    return "livre" as const;
  }

  return (
    <section id="agenda" className="bg-nevoa py-20">
      <div className="mx-auto max-w-[1060px] px-6">
        <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-vermelho">
          Verifique sua data
        </p>
        <h2 className="mb-3 max-w-[22ch] text-[clamp(26px,3.6vw,36px)] font-bold tracking-[-0.02em]">
          Veja se o seu dia está livre
        </h2>
        <p className="mb-10 max-w-[54ch] text-[17px] text-cinza">
          Nossa agenda está aqui, em tempo real. Escolha a data do seu evento — se estiver
          livre, é só chamar no WhatsApp que a gente confirma na hora.
        </p>

        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_300px] md:items-start">
          {/* Calendário */}
          <div className="rounded-2xl border border-borda bg-papel p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setOffset((o) => Math.max(0, o - 1))}
                disabled={offset === 0}
                aria-label="Mês anterior"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-borda text-tinta transition-colors hover:border-cinza disabled:cursor-not-allowed disabled:opacity-30"
              >
                ‹
              </button>
              <span className="text-[15px] font-semibold">
                {MESES[mes].charAt(0).toUpperCase() + MESES[mes].slice(1)} de {ano}
              </span>
              <button
                type="button"
                onClick={() => setOffset((o) => Math.min(MESES_A_FRENTE, o + 1))}
                disabled={offset === MESES_A_FRENTE}
                aria-label="Próximo mês"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-borda text-tinta transition-colors hover:border-cinza disabled:cursor-not-allowed disabled:opacity-30"
              >
                ›
              </button>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-cinza">
              {DIAS_SEMANA.map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {celulas.map((dia, i) => {
                if (dia === null) return <span key={`v${i}`} className="h-11" />;
                const d = iso(ano, mes, dia);
                const st = estado(dia);
                const escolhida = selecionada === d;

                if (st !== "livre") {
                  return (
                    <span
                      key={d}
                      aria-disabled="true"
                      title={st === "ocupado" ? "Data ocupada" : undefined}
                      className={`flex h-11 items-center justify-center rounded-lg text-sm ${
                        st === "ocupado"
                          ? "text-cinza line-through decoration-vermelho/60"
                          : "text-borda"
                      }`}
                    >
                      {dia}
                    </span>
                  );
                }

                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelecionada(d)}
                    className={`flex h-11 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      escolhida
                        ? "bg-vermelho text-white"
                        : "text-tinta hover:bg-vermelho/10"
                    }`}
                  >
                    {dia}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-cinza">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-vermelho" /> Selecionada
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 text-center leading-none line-through decoration-vermelho/60">
                  0
                </span>{" "}
                Ocupada
              </span>
              {carregando && <span>carregando agenda…</span>}
            </div>
          </div>

          {/* Painel da escolha */}
          <div className="rounded-2xl border border-borda bg-papel p-6">
            {selecionada ? (
              <>
                <p className="text-sm text-cinza">Data escolhida</p>
                <p className="mt-1 text-2xl font-bold tracking-[-0.02em]">
                  {paraBR(selecionada)}
                </p>
                <p className="mt-3 text-[15px] text-cinza">
                  Livre na nossa agenda. Chame no WhatsApp que a gente confirma e monta seu
                  orçamento.
                </p>
                <a
                  href={linkData(paraBR(selecionada))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-vermelho px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-vermelho-escuro"
                >
                  <IconeWhatsApp className="h-[18px] w-[18px]" />
                  Verificar {paraBR(selecionada)}
                </a>
              </>
            ) : (
              <>
                <p className="text-[15px] font-semibold">Escolha uma data</p>
                <p className="mt-2 text-[15px] text-cinza">
                  Toque num dia livre no calendário pra seguir pro WhatsApp com a data já
                  preenchida.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
