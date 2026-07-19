import Anthropic from "@anthropic-ai/sdk";
import type { No, Opcao } from "./flow";

// Modelo padrão: Opus 4.8. Trocável por env (ex: CLAUDE_MODEL=claude-haiku-4-5
// corta bastante o custo por conversa, com leve perda de precisão).
const MODEL = process.env.CLAUDE_MODEL || "claude-opus-4-8";

// Cliente lê ANTHROPIC_API_KEY do ambiente. Só instanciamos se houver chave,
// pra não quebrar quando a IA ainda não estiver configurada.
const client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;

// Dado o nó atual (com suas opções) e o texto livre do cliente, usa a IA da
// Claude pra escolher a opção que melhor corresponde à intenção. Retorna a
// opção casada, ou null (aí o webhook cai no fallback "não entendi").
export async function interpretar(
  no: No | undefined,
  texto: string,
): Promise<Opcao | null> {
  if (!client) return null; // IA não configurada
  if (!no || (no.type !== "buttons" && no.type !== "list")) return null;

  const opcoes = no.options;
  const lista = opcoes.map((o) => `- ${o.id}: ${o.label}`).join("\n");

  const prompt = `Você é o roteador de um chatbot de WhatsApp de uma loja de motos usadas (Ultra Scooter Garage).
O cliente está num passo da conversa com estas opções (formato "id: rótulo"):
${lista}

O cliente respondeu com texto livre: "${texto}"

Escolha o id da opção que melhor corresponde à intenção do cliente.
Regras:
- Responda APENAS com o id exato (ex: "org_scooter"), nada mais.
- Se nenhuma opção corresponder de forma razoável, responda exatamente "nenhuma".
- Não explique.`;

  try {
    const r = await client.messages.create({
      model: MODEL,
      max_tokens: 20,
      messages: [{ role: "user", content: prompt }],
    });
    const resposta =
      r.content
        .find((b) => b.type === "text")
        ?.text?.trim()
        .toLowerCase() ?? "";
    return opcoes.find((o) => o.id.toLowerCase() === resposta) ?? null;
  } catch (e: any) {
    console.error("[claude] falha ao interpretar:", e?.message);
    return null; // degrada pro fallback determinístico
  }
}
