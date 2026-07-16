import type { Moto } from "./types";
import { titulo, preco } from "./format";

const NUMERO = process.env.NEXT_PUBLIC_WHATSAPP ?? "";

/**
 * O CTA do site inteiro.
 *
 * A mensagem vai PRÉ-PREENCHIDA com a moto. Sem isso o vendedor recebe um "oi"
 * solto e não sabe de qual moto o cliente está falando — e o lead morre na
 * fricção de descobrir. Esse detalhe vale mais pra loja que qualquer feature
 * sofisticada do catálogo.
 */
export function linkMoto(moto: Moto) {
  const texto =
    `Olá! Tenho interesse na ${titulo(moto)} ` +
    `(${preco(moto.preco)}) que vi no site.`;
  return `https://wa.me/${NUMERO}?text=${encodeURIComponent(texto)}`;
}

export function linkGeral(texto = "Olá! Vim pelo site e gostaria de falar com vocês.") {
  return `https://wa.me/${NUMERO}?text=${encodeURIComponent(texto)}`;
}
