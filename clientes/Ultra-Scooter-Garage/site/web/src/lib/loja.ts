type Loja = {
  nome: string;
  rua: string;
  /** "Tatuapé", "Mooca". Vazio = ainda não confirmado com o cliente. */
  bairro: string;
  /** A preposição do bairro. "no" Tatuapé, mas "na" Mooca, "na" Lapa. */
  bairroPreposicao: "no" | "na";
  cidade: string;
  uf: string;
  cep: string;
  /** Perfil da loja no Google (Business Profile). Alimenta o SEO local. */
  google: string;
  /** Instagram da loja (URL completa). O @ aparece no card das fotos de estúdio. */
  instagram: string;
};

/**
 * Dados da loja num lugar só.
 *
 * O `bairro` não é enfeite de rodapé — é a peça central do SEO local. "Moto usada
 * São Paulo" é praça perdida pra Webmotors e Mercado Livre; a loja ganha em
 * "scooter usada no <bairro>", porque ninguém atravessa São Paulo pra ver uma moto
 * e o marketplace rankeia mal nessa cauda longa.
 *
 * Sem `as const`: com ele, `bairro` teria o tipo literal `""` e preencher o bairro
 * — a única edição que este arquivo existe pra receber — quebraria o build.
 */
export const LOJA: Loja = {
  nome: "Ultra Scooter Garage",
  rua: "Rua Marechal Barbacena, 823",

  // O Tatuapé é o alvo de SEO da loja — é o que as pessoas digitam no Google, e é
  // onde a Webmotors rankeia mal. "Moto usada São Paulo" é briga perdida.
  bairro: "Tatuapé",
  bairroPreposicao: "no",

  cidade: "São Paulo",
  uf: "SP",

  // TODO: pedir o CEP ao cliente — completa o JSON-LD de LocalBusiness.
  cep: "",

  google: "https://share.google/6YPsc4PUGcFMfDkmZ",
  instagram: "https://instagram.com/ultrascootergarage",
};

/**
 * Horário de funcionamento — confirmado pelo cliente em 15/07/2026.
 * Deve continuar batendo com o Google; se mudar lá, mudar aqui.
 */
export const HORARIO: { dias: string; horas: string }[] = [
  { dias: "Segunda a sexta", horas: "09h às 18h" },
  { dias: "Sábado", horas: "09h às 13h" },
  { dias: "Domingo", horas: "Fechado" },
];

/** Endereço só com vírgulas, pro Google resolver (mapa, rotas). */
function enderecoQuery() {
  return [LOJA.rua, LOJA.bairro, `${LOJA.cidade} - ${LOJA.uf}`].filter(Boolean).join(", ");
}

/**
 * URL do mapa embutido (iframe). `output=embed` não precisa de API key.
 * Inclui o nome da loja pra o Google cair no perfil certo, não só no endereço.
 */
export function mapaEmbedSrc() {
  const q = encodeURIComponent(`${LOJA.nome}, ${enderecoQuery()}`);
  return `https://www.google.com/maps?q=${q}&output=embed`;
}

/** Abre a rota até a loja no app de mapas do usuário. */
export function linkComoChegar() {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    enderecoQuery(),
  )}`;
}

/** Só o nome do lugar: "Tatuapé", ou "São Paulo" enquanto o bairro não vier. */
export function praca() {
  return LOJA.bairro || LOJA.cidade;
}

/**
 * O lugar já com preposição, pronto pra emendar numa frase:
 * "Loja física no Tatuapé" · "Scooters usadas em São Paulo"
 *
 * Existe porque a preposição muda com o bairro — "no Tatuapé" mas "na Mooca" —
 * e concatenar `no ${praca()}` na mão produzia "no São Paulo" em todo lugar.
 */
export function pracaFrase() {
  return LOJA.bairro ? `${LOJA.bairroPreposicao} ${LOJA.bairro}` : `em ${LOJA.cidade}`;
}

/** "Rua Marechal Barbacena, 823 — Tatuapé, São Paulo/SP" */
export function enderecoCompleto() {
  const local = [LOJA.bairro, `${LOJA.cidade}/${LOJA.uf}`].filter(Boolean).join(", ");
  return `${LOJA.rua} — ${local}`;
}

export function linkMapa() {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${LOJA.rua}, ${LOJA.cidade}`,
  )}`;
}
