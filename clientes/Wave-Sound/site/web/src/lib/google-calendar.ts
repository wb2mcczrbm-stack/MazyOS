import "server-only";
import ical from "node-ical";
import { JWT } from "google-auth-library";

/**
 * Leitura de disponibilidade da agenda do Google (Nível A: só livre/ocupado).
 *
 * NUNCA escreve nada. Dois caminhos, nessa ordem de preferência:
 *
 * 1. iCal (recomendado — sem Google Cloud, sem cartão):
 *    GOOGLE_CALENDAR_ICS_URL = "endereço secreto no formato iCal" da agenda
 *    (Google Calendar → Configurações da agenda → Integrar agenda). O site lê
 *    esse link SÓ no servidor e devolve apenas as datas — o link (que expõe
 *    detalhes) nunca chega ao navegador. Se vazar, é só resetá-lo no Google.
 *
 * 2. Service account (freeBusy) — alternativa, exige projeto no Google Cloud:
 *    GOOGLE_CALENDAR_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_KEY
 *
 * Sem nenhum dos dois, degrada pra "nada ocupado" — o site funciona e mostra
 * todas as datas futuras livres.
 */

const FUSO = "America/Sao_Paulo";
const DIA_MS = 24 * 60 * 60 * 1000;

function temIcs() {
  return Boolean(process.env.GOOGLE_CALENDAR_ICS_URL);
}
function temServiceAccount() {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY &&
      process.env.GOOGLE_CALENDAR_ID,
  );
}

export function calendarioConfigurado(): boolean {
  return temIcs() || temServiceAccount();
}

/** "YYYY-MM-DD" a partir dos componentes LOCAIS (pra eventos de dia inteiro,
 *  que o parser cria como meia-noite local). */
function diaLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/** "YYYY-MM-DD" no fuso de SP (pra eventos com horário — instantes reais). */
function diaSP(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: FUSO });
}

/** Marca no Set todos os dias tocados por [start, end) usando o formatador dado. */
function marcarDias(
  dias: Set<string>,
  start: Date,
  end: Date,
  fmt: (d: Date) => string,
) {
  const fimT = end.getTime();
  let t = start.getTime();
  let guard = 0;
  while (t < fimT && guard++ < 800) {
    dias.add(fmt(new Date(t)));
    t += DIA_MS / 2; // passo de 12h: cobre todo dia sem depender de horário de verão
  }
  // último instante (end é exclusivo), pra não perder o dia final
  dias.add(fmt(new Date(Math.max(start.getTime(), fimT - 1))));
}

async function ocupadasViaIcs(inicio: Date, fim: Date): Promise<string[]> {
  const url = process.env.GOOGLE_CALENDAR_ICS_URL as string;
  const resp = await fetch(url, { cache: "no-store" });
  if (!resp.ok) throw new Error(`iCal ${resp.status}`);
  const texto = await resp.text();
  const dados = ical.sync.parseICS(texto);

  const dias = new Set<string>();
  const inicioT = inicio.getTime();
  const fimT = fim.getTime();

  for (const k of Object.keys(dados)) {
    const ev = dados[k] as ical.VEvent;
    if (!ev || ev.type !== "VEVENT" || !ev.start) continue;

    const diaInteiro = ev.datetype === "date";
    const fmt = diaInteiro ? diaLocal : diaSP;
    const start = ev.start as Date;
    const end = (ev.end as Date) ?? new Date(start.getTime() + DIA_MS);
    const duracao = Math.max(0, end.getTime() - start.getTime());

    if (ev.rrule) {
      // Evento recorrente: expande as ocorrências dentro da janela pedida.
      const ocorrencias = ev.rrule.between(inicio, fim, true);
      for (const oc of ocorrencias) {
        marcarDias(dias, oc, new Date(oc.getTime() + duracao), fmt);
      }
      continue;
    }

    // Evento simples: só marca se cruza a janela [inicio, fim].
    if (end.getTime() < inicioT || start.getTime() > fimT) continue;
    marcarDias(dias, start, end, fmt);
  }

  return [...dias].sort();
}

async function ocupadasViaFreeBusy(inicio: Date, fim: Date): Promise<string[]> {
  const key = (process.env.GOOGLE_SERVICE_ACCOUNT_KEY ?? "").replace(/\\n/g, "\n");
  const jwt = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key,
    scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
  });
  const { access_token } = await jwt.authorize();
  const calId = process.env.GOOGLE_CALENDAR_ID as string;

  const resp = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin: inicio.toISOString(),
      timeMax: fim.toISOString(),
      timeZone: FUSO,
      items: [{ id: calId }],
    }),
  });
  if (!resp.ok) throw new Error(`freeBusy ${resp.status}: ${await resp.text()}`);

  const data = (await resp.json()) as {
    calendars?: Record<string, { busy?: { start: string; end: string }[] }>;
  };
  const busy = data.calendars?.[calId]?.busy ?? [];

  const dias = new Set<string>();
  for (const b of busy) {
    marcarDias(dias, new Date(b.start), new Date(b.end), diaSP);
  }
  return [...dias].sort();
}

/**
 * Datas (YYYY-MM-DD, fuso SP) com qualquer ocupação no período. Um evento que
 * cobre parte do dia marca o dia inteiro — a regra é "não pega dois eventos no
 * mesmo dia".
 */
export async function datasOcupadas(inicio: Date, fim: Date): Promise<string[]> {
  if (temIcs()) return ocupadasViaIcs(inicio, fim);
  if (temServiceAccount()) return ocupadasViaFreeBusy(inicio, fim);
  return [];
}
