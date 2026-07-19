import { db } from "./supabase";

// Versão da Graph API. WhatsApp Cloud API usa graph.facebook.com (não o
// graph.instagram.com do outro projeto). Deixamos configurável por env.
const VERSION = process.env.WA_GRAPH_VERSION || "v21.0";
const BASE = `https://graph.facebook.com/${VERSION}`;

type Config = {
  access_token: string | null;
  phone_number_id: string | null;
};

// Lê a credencial do banco (linha única de config).
async function getConfig(): Promise<Config> {
  const { data, error } = await db
    .from("config")
    .select("access_token, phone_number_id")
    .eq("id", 1)
    .single();
  if (error) throw new Error("Falha ao ler config: " + error.message);
  if (!data?.access_token || !data?.phone_number_id) {
    throw new Error("Config incompleta: falta access_token ou phone_number_id.");
  }
  return data;
}

// Envia qualquer corpo já montado pro endpoint /messages.
// Retorna o wamid (id da mensagem na Meta) pra dedupe/rastreio.
export async function sendRaw(
  body: Record<string, unknown>,
): Promise<{ ok: boolean; wamid?: string; error?: string }> {
  const { access_token, phone_number_id } = await getConfig();
  const res = await fetch(`${BASE}/${phone_number_id}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messaging_product: "whatsapp", ...body }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.error?.message || `HTTP ${res.status}`;
    return { ok: false, error: msg };
  }
  return { ok: true, wamid: json?.messages?.[0]?.id };
}

// ---- Helpers de montagem (respeitam os limites da Meta) ----

export function textPayload(to: string, body: string) {
  return {
    to,
    type: "text",
    text: { body: body.slice(0, 4096), preview_url: true },
  };
}

export type Botao = { id: string; label: string };

// Botões de resposta rápida: no máximo 3, título até 20 caracteres.
export function buttonsPayload(to: string, body: string, botoes: Botao[]) {
  return {
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: body.slice(0, 1024) },
      action: {
        buttons: botoes.slice(0, 3).map((b) => ({
          type: "reply",
          reply: { id: b.id.slice(0, 256), title: b.label.slice(0, 20) },
        })),
      },
    },
  };
}

export type ItemLista = { id: string; label: string; descricao?: string };

// Lista (menu): até 10 itens no total, título até 24 caracteres.
export function listPayload(
  to: string,
  body: string,
  botaoLabel: string,
  itens: ItemLista[],
) {
  return {
    to,
    type: "interactive",
    interactive: {
      type: "list",
      body: { text: body.slice(0, 1024) },
      action: {
        button: botaoLabel.slice(0, 20),
        sections: [
          {
            title: "Opções",
            rows: itens.slice(0, 10).map((i) => ({
              id: i.id.slice(0, 200),
              title: i.label.slice(0, 24),
              ...(i.descricao ? { description: i.descricao.slice(0, 72) } : {}),
            })),
          },
        ],
      },
    },
  };
}

// Botão com URL (CTA). Útil pra entregar o link do catálogo com um toque.
export function ctaUrlPayload(
  to: string,
  body: string,
  label: string,
  url: string,
) {
  return {
    to,
    type: "interactive",
    interactive: {
      type: "cta_url",
      body: { text: body.slice(0, 1024) },
      action: {
        name: "cta_url",
        parameters: { display_text: label.slice(0, 20), url },
      },
    },
  };
}
