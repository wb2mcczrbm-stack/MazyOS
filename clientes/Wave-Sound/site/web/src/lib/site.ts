/**
 * Constantes do negócio, num lugar só.
 *
 * Contato, endereço e pacotes vêm daqui pra não haver duas versões do telefone
 * ou do preço espalhadas pelo site. Mudou o número? Muda aqui e acabou.
 */

export const SITE = {
  nome: "Wave Sound",
  marca: "wave.snd",
  tagline: "Sonorização de eventos",
  // Sonorização vende confiança: casamento não tem segunda chance se o som falha.
  descricao:
    "Sonorização profissional para casamentos, shows e conferências em São Paulo. " +
    "Equipamento de verdade, instalação e suporte no dia — do primeiro teste ao último acorde.",

  telefone: "(11) 99242-8118",
  // Formato internacional pro deep link do WhatsApp (55 + DDD + número).
  whatsapp: "5511992428118",
  email: "contato@wavesnd.com.br",
  instagram: "wave.snd",
  instagramUrl: "https://instagram.com/wave.snd",

  endereco: {
    rua: "Rua Coronel Irineu Castro, 43",
    bairro: "Jd. Anália Franco",
    cidade: "São Paulo",
    uf: "SP",
    cep: "03333-050",
  },
} as const;

/**
 * Frase de área de atendimento. A Wave atende a capital E o estado de São Paulo
 * (não só o bairro da sede) — a copy reflete isso. O bairro segue no rodapé e no
 * JSON-LD como endereço físico, que é o que sustenta o SEO local.
 */
export function pracaFrase() {
  return `em São Paulo, capital e estado`;
}

export type Pacote = {
  nome: string;
  preco: string; // exibido como "a partir de" — âncora, não preço fechado
  linha: string; // pra quem serve
  destaque?: boolean; // "Mais pedido"
};

/**
 * Os 4 pacotes. Preço como "a partir de": âncora que filtra o lead sério, com o
 * fechamento fino via WhatsApp (decisão do cliente, ver briefing).
 */
export const PACOTES: Pacote[] = [
  { nome: "Som Essencial", preco: "700", linha: "Cerimônias e eventos íntimos." },
  {
    nome: "Som Profissional",
    preco: "1.300",
    linha: "Festas e eventos corporativos.",
    destaque: true,
  },
  { nome: "Som Premium", preco: "2.500", linha: "Shows e palcos maiores." },
  { nome: "Experiência Completa", preco: "5.000", linha: "Produção de ponta a ponta." },
];
