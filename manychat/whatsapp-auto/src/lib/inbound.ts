import { db } from "./supabase";
import { textPayload } from "./wa";
import {
  iniciar,
  caminhar,
  casarOpcao,
  avancar,
  type FlowDef,
  type SaidaMsg,
} from "./flow";
import { interpretar } from "./claude";

// ------------------------------------------------------------
// Extrai o "input" e o texto legível de uma mensagem da Cloud API.
//  - clique em botão/lista  -> input = id da opção (o fluxo casa por id)
//  - texto livre            -> input = o texto digitado
// ------------------------------------------------------------
function extrair(msg: any): {
  input: string;
  body: string;
  referral: any | null;
} {
  const t = msg.type;
  if (t === "text") {
    const b = msg.text?.body ?? "";
    return { input: b, body: b, referral: msg.referral ?? null };
  }
  if (t === "interactive") {
    const it = msg.interactive;
    const r = it?.button_reply ?? it?.list_reply;
    return {
      input: r?.id ?? "",
      body: r?.title ?? "",
      referral: msg.referral ?? null,
    };
  }
  if (t === "button") {
    // quick reply de template
    return {
      input: msg.button?.payload ?? msg.button?.text ?? "",
      body: msg.button?.text ?? "",
      referral: msg.referral ?? null,
    };
  }
  // mídia e outros: sem input pro fluxo, mas registramos algo legível
  return { input: "", body: `[${t}]`, referral: msg.referral ?? null };
}

// Cliente pedindo humano explicitamente, em qualquer ponto.
function pedeHumano(input: string): boolean {
  const s = input.toLowerCase();
  return /(humano|atendente|vendedor|pessoa|falar com algu[ée]m)/.test(s);
}

// Pega o fluxo que o contato está seguindo, ou o primeiro fluxo ativo.
async function flowAtivo(currentFlowId: string | null): Promise<any | null> {
  if (currentFlowId) {
    const { data } = await db
      .from("flows")
      .select("*")
      .eq("id", currentFlowId)
      .single();
    if (data) return data;
  }
  const { data } = await db
    .from("flows")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

// Enfileira as mensagens de saída e registra no histórico do inbox.
async function enfileirar(
  waId: string,
  flowId: string,
  msgs: SaidaMsg[],
): Promise<void> {
  for (const m of msgs) {
    await db.from("queue").insert({
      wa_id: waId,
      flow_id: flowId,
      node: m.node,
      payload: m.payload,
      status: "pending",
      send_after: new Date().toISOString(),
    });
    await db.from("messages").insert({
      wa_id: waId,
      direction: "out",
      author: "bot",
      body: m.text,
    });
  }
}

// Processa UMA mensagem recebida.
async function handleMessage(msg: any, nome?: string): Promise<void> {
  const waId: string = msg.from;
  const wamid: string = msg.id;
  if (!waId || !wamid) return;

  // Dedupe: a Meta pode reentregar o mesmo evento.
  const { data: jaVi } = await db
    .from("messages")
    .select("id")
    .eq("wamid", wamid)
    .maybeSingle();
  if (jaVi) return;

  const { input, body, referral } = extrair(msg);

  // Garante o contato e abre a janela de 24h (última msg dele = agora).
  const { data: existente } = await db
    .from("contacts")
    .select("*")
    .eq("wa_id", waId)
    .maybeSingle();

  if (!existente) {
    await db.from("contacts").insert({ wa_id: waId, name: nome ?? null });
  } else if (nome && nome !== existente.name) {
    await db.from("contacts").update({ name: nome }).eq("wa_id", waId);
  }
  await db
    .from("contacts")
    .update({ last_inbound_at: new Date().toISOString() })
    .eq("wa_id", waId);

  const contato = existente ?? {
    wa_id: waId,
    current_flow_id: null,
    current_node: null,
    state: {},
    handed_off: false,
  };

  // Registra a mensagem recebida (o inbox mostra na hora).
  await db.from("messages").insert({
    wa_id: waId,
    direction: "in",
    author: "client",
    body,
    wamid,
    raw: msg,
  });

  // Se já está em atendimento humano, o bot cala a boca. O inbox mostra.
  if (contato.handed_off) return;

  const flow = await flowAtivo(contato.current_flow_id);
  if (!flow) return; // nenhum fluxo configurado ainda
  const def = flow.definition as FlowDef;
  const state: Record<string, string> = contato.state ?? {};

  let resultado;

  if (pedeHumano(input) && def.nodes["handoff"]) {
    // Atalho universal: pediu humano -> vai pro handoff.
    resultado = caminhar(def, "handoff", waId, state);
  } else if (!contato.current_node) {
    // Conversa nova. Veio de anúncio? Abre no caminho "anuncio".
    if (referral && def.nodes["anuncio"]) {
      const modelo = referral.headline || referral.body || "essa moto";
      resultado = caminhar(def, "anuncio", waId, { ...state, modelo });
    } else {
      resultado = iniciar(def, waId, state);
    }
  } else {
    // No meio do fluxo: casa o input com uma opção do nó atual.
    const no = def.nodes[contato.current_node];
    // 1) casa direto (clique em botão ou texto igual ao rótulo)
    let opcao = casarOpcao(no, input);
    // 2) não casou e é texto livre? tenta a IA da Claude entender a intenção
    if (!opcao && input.trim()) {
      opcao = await interpretar(no, input);
    }
    if (opcao) {
      resultado = avancar(def, contato.current_node, opcao, waId, state);
    } else {
      // Nem clique, nem IA entenderam: pede desculpa e repete as opções.
      const repeticao = caminhar(def, contato.current_node, waId, state);
      const aviso: SaidaMsg = {
        payload: textPayload(
          waId,
          "Desculpa, não entendi 🙈 É só tocar numa das opções abaixo:",
        ),
        text: "Desculpa, não entendi 🙈 É só tocar numa das opções abaixo:",
        node: contato.current_node,
      };
      resultado = { ...repeticao, msgs: [aviso, ...repeticao.msgs] };
    }
  }

  // Persiste o novo estado do contato.
  await db
    .from("contacts")
    .update({
      current_flow_id: flow.id,
      current_node: resultado.endNode,
      state: resultado.state,
      handed_off: contato.handed_off || resultado.handedOff,
    })
    .eq("wa_id", waId);

  await enfileirar(waId, flow.id, resultado.msgs);
}

// Ponto de entrada: recebe o corpo do webhook já parseado.
export async function handleInbound(payload: any): Promise<void> {
  const changes =
    payload?.entry?.flatMap((e: any) => e.changes ?? []) ?? [];

  for (const ch of changes) {
    if (ch.field !== "messages") continue;
    const value = ch.value ?? {};

    // registra o evento cru
    await db.from("events").insert({ kind: "message", raw: value });

    const nomePorWa: Record<string, string> = {};
    for (const c of value.contacts ?? []) {
      if (c.wa_id) nomePorWa[c.wa_id] = c.profile?.name;
    }
    for (const msg of value.messages ?? []) {
      try {
        await handleMessage(msg, nomePorWa[msg.from]);
      } catch (e: any) {
        console.error("[inbound] erro ao processar msg:", e?.message);
      }
    }
  }
}
