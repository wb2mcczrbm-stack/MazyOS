import type { Moto } from "./types";

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const NUM = new Intl.NumberFormat("pt-BR");

export const preco = (v: number) => BRL.format(v);
export const km = (v: number) => `${NUM.format(v)} km`;

/** "2022/2023" quando fabricação e modelo divergem; "2022" quando são iguais. */
export const anos = (m: Pick<Moto, "ano_fabricacao" | "ano_modelo">) =>
  m.ano_fabricacao === m.ano_modelo
    ? String(m.ano_fabricacao)
    : `${m.ano_fabricacao}/${m.ano_modelo}`;

export const titulo = (m: Pick<Moto, "marca" | "modelo" | "ano_fabricacao" | "ano_modelo">) =>
  `${m.marca} ${m.modelo} ${anos(m)}`;

/**
 * Simulação de parcela — Tabela Price.
 *
 * Ticket de R$ 25 mil em B2C: quase ninguém paga à vista, então a parcela é o
 * número que o comprador realmente compara. Mas a taxa aqui é uma ESTIMATIVA de
 * mercado, não uma oferta — a UI é obrigada a dizer isso em texto visível.
 * Prometer taxa que não se sustenta é exatamente a "falsa promessa" que o
 * _memoria/preferencias.md manda evitar.
 */
export function parcela(precoTotal: number, meses = 48, taxaMensal = 0.0199, entradaPct = 0.2) {
  const financiado = precoTotal * (1 - entradaPct);
  const i = taxaMensal;
  const valor = (financiado * i) / (1 - Math.pow(1 + i, -meses));
  return { meses, valor, entrada: precoTotal * entradaPct };
}

/** honda-cb-500f-2022-a1b2 — estável, é o que o Google indexa. */
export function gerarSlug(m: Pick<Moto, "marca" | "modelo" | "ano_modelo">) {
  const base = `${m.marca} ${m.modelo} ${m.ano_modelo}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Sufixo curto: a loja pode ter duas CB 500F 2022 no pátio.
  const sufixo = Math.random().toString(36).slice(2, 6);
  return `${base}-${sufixo}`;
}
