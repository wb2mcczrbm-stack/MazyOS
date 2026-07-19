import { preencher } from "./greeting";
import {
  buttonsPayload,
  listPayload,
  textPayload,
  ctaUrlPayload,
  type Botao,
  type ItemLista,
} from "./wa";

// ------------------------------------------------------------
// Formato do fluxo (o que fica no campo definition JSON de flows)
// ------------------------------------------------------------
export type Opcao = {
  id: string; // vira o id do botão/linha (o webhook casa por aqui)
  label: string; // texto do botão
  descricao?: string; // só em listas
  next: string; // chave do próximo nó
  set?: Record<string, string>; // grava no state do contato (ex: {modelo:"NMAX"})
};

export type No =
  | { type: "buttons"; text: string; options: Opcao[] }
  | { type: "list"; text: string; listButton?: string; options: Opcao[] }
  | { type: "text"; text: string; next?: string }
  | {
      type: "link";
      text: string;
      linkLabel: string;
      linkUrl: string;
      next?: string;
    }
  | { type: "handoff"; text: string };

export type FlowDef = {
  entry: string | null;
  nodes: Record<string, No>;
};

// Uma mensagem de saída: o corpo pronto pra Cloud API + o texto legível
// (pro histórico do inbox) + de qual nó veio.
export type SaidaMsg = {
  payload: Record<string, unknown>;
  text: string;
  node: string;
};

export type Resultado = {
  msgs: SaidaMsg[];
  endNode: string | null; // onde a conversa fica esperando (null = acabou)
  handedOff: boolean; // passou por um nó de handoff?
  state: Record<string, string>; // state atualizado do contato
};

// Descrição curta e legível de um nó, pra registrar no inbox.
function legivel(no: No, texto: string): string {
  if (no.type === "link") return `${texto}\n${no.linkUrl}`;
  return texto;
}

// Converte um nó em mensagem(ns) da Cloud API.
function montar(
  no: No,
  to: string,
  vars: Record<string, string>,
  nodeKey: string,
): SaidaMsg {
  const texto = preencher(no.text, vars);

  switch (no.type) {
    case "buttons": {
      const botoes: Botao[] = no.options.map((o) => ({
        id: o.id,
        label: o.label,
      }));
      return { payload: buttonsPayload(to, texto, botoes), text: texto, node: nodeKey };
    }
    case "list": {
      const itens: ItemLista[] = no.options.map((o) => ({
        id: o.id,
        label: o.label,
        descricao: o.descricao,
      }));
      return {
        payload: listPayload(to, texto, no.listButton || "Ver opções", itens),
        text: texto,
        node: nodeKey,
      };
    }
    case "link": {
      return {
        payload: ctaUrlPayload(to, texto, no.linkLabel, no.linkUrl),
        text: legivel(no, texto),
        node: nodeKey,
      };
    }
    case "text":
    case "handoff":
    default:
      return { payload: textPayload(to, texto), text: texto, node: nodeKey };
  }
}

// A partir de um nó, caminha enquanto os nós forem de "auto-avanço"
// (text/link com next), montando as mensagens, até parar num nó que
// espera resposta (buttons/list) ou num fim/handoff.
export function caminhar(
  def: FlowDef,
  from: string,
  to: string,
  state: Record<string, string>,
): Resultado {
  const msgs: SaidaMsg[] = [];
  let atual: string | null = from;
  let handedOff = false;
  const vars = { ...state };
  const visitados = new Set<string>(); // trava anti-loop infinito

  while (atual && !visitados.has(atual)) {
    visitados.add(atual);
    const no: No | undefined = def.nodes[atual];
    if (!no) break;

    msgs.push(montar(no, to, vars, atual));

    if (no.type === "handoff") {
      handedOff = true;
      atual = null;
      break;
    }
    if (no.type === "text" || no.type === "link") {
      atual = no.next ?? null; // emenda no próximo
      continue;
    }
    // buttons / list: para e espera a resposta do cliente
    break;
  }

  return { msgs, endNode: atual, handedOff, state: vars };
}

// Inicia o fluxo no nó de entrada.
export function iniciar(
  def: FlowDef,
  to: string,
  state: Record<string, string> = {},
): Resultado {
  if (!def.entry) return { msgs: [], endNode: null, handedOff: false, state };
  return caminhar(def, def.entry, to, state);
}

// Dado o nó atual (que espera resposta) e o input do cliente, acha a
// opção escolhida. `input` pode ser o id do botão/linha OU texto livre.
// Retorna a opção casada ou null (aí o webhook chama a IA / repete).
export function casarOpcao(no: No | undefined, input: string): Opcao | null {
  if (!no || (no.type !== "buttons" && no.type !== "list")) return null;
  const alvo = input.trim().toLowerCase();

  // 1) casa exato pelo id (clique em botão/linha)
  const porId = no.options.find((o) => o.id.toLowerCase() === alvo);
  if (porId) return porId;

  // 2) casa pelo texto do rótulo (cliente digitou algo igual/parecido)
  const porLabel = no.options.find(
    (o) =>
      o.label.toLowerCase() === alvo ||
      alvo.includes(o.label.toLowerCase()) ||
      o.label.toLowerCase().includes(alvo),
  );
  return porLabel ?? null;
}

// Avança do nó atual pela opção escolhida: aplica o `set` no state e
// caminha a partir do próximo nó.
export function avancar(
  def: FlowDef,
  atual: string,
  opcao: Opcao,
  to: string,
  state: Record<string, string>,
): Resultado {
  const novoState = { ...state, ...(opcao.set ?? {}) };
  return caminhar(def, opcao.next, to, novoState);
}
