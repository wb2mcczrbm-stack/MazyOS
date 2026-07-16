export type MotoStatus = "DISPONIVEL" | "RESERVADA" | "VENDIDA";

export type Foto = {
  id: string;
  moto_id: string;
  path: string;
  ordem: number;
};

export type Moto = {
  id: string;
  slug: string;
  marca: string;
  modelo: string;
  ano_fabricacao: number;
  ano_modelo: number;
  km: number;
  cilindrada: number | null;
  cor: string | null;
  placa_final: string | null;
  preco: number;
  descricao: string | null;
  status: MotoStatus;
  destaque: boolean;
  criado_em: string;
  atualizado_em: string;
  vendido_em: string | null;
  /** Quando foi mandada pra lixeira. null = ativa. Some do site; recuperável 10 dias. */
  apagada_em: string | null;
};

export type MotoComFotos = Moto & { fotos: Foto[] };

/**
 * Payload de escrita do admin. Mora aqui e não em actions.ts porque um arquivo
 * "use server" só pode exportar função async — exportar tipo de lá funciona por
 * acidente (TS apaga na compilação) e quebra quando alguém menos avisado mexe.
 */
export type DadosMoto = Omit<
  Moto,
  "id" | "slug" | "criado_em" | "atualizado_em" | "vendido_em" | "apagada_em"
>;

export const STATUS_LABEL: Record<MotoStatus, string> = {
  DISPONIVEL: "Disponível",
  RESERVADA: "Reservada",
  VENDIDA: "Vendida",
};

/** Status que aparecem na vitrine. VENDIDA some do site mas fica no banco. */
export const STATUS_VISIVEIS: MotoStatus[] = ["DISPONIVEL", "RESERVADA"];
