import { db } from "./supabase";
import { sendRaw } from "./wa";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const MAX_TENTATIVAS = 4;

// Drena a fila: pega um lote com trava atômica (claim_queue marca como
// 'sending' numa transação, então dois workers nunca pegam o mesmo item),
// envia cada um e atualiza o status. ~2 envios/seg.
export async function drainQueue(batch = 20): Promise<number> {
  const { data: itens, error } = await db.rpc("claim_queue", { batch });
  if (error) {
    console.error("[drain] claim_queue falhou:", error.message);
    return 0;
  }
  if (!itens?.length) return 0;

  let enviados = 0;
  for (const item of itens as Array<Record<string, any>>) {
    // Blindagem: se sendRaw estourar (config faltando, rede), tratamos como
    // falha normal — o item não pode ficar preso em 'sending'.
    const r = await sendRaw(item.payload).catch((e: any) => ({
      ok: false as const,
      error: e?.message ?? "exceção no envio",
    }));

    if (r.ok) {
      await db
        .from("queue")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", item.id);
      enviados++;
    } else {
      const desistir = item.attempts >= MAX_TENTATIVAS;
      await db
        .from("queue")
        .update({
          status: desistir ? "failed" : "pending",
          last_error: r.error ?? "erro desconhecido",
          claimed_at: null,
          // tenta de novo daqui a 1 min se ainda não desistiu
          send_after: new Date(Date.now() + 60_000).toISOString(),
        })
        .eq("id", item.id);
      console.error(`[drain] envio falhou (${item.id}):`, r.error);
    }

    await sleep(500); // trava em ~2/seg pra respeitar o limite prático
  }
  return enviados;
}
