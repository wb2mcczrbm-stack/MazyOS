import { SITE } from "./site";

/**
 * O CTA do site inteiro.
 *
 * A mensagem vai PRÉ-PREENCHIDA com o pacote (e uma linha pra data do evento).
 * Sem isso a Wave recebe um "oi" solto e não sabe de qual evento se trata — e o
 * lead morre na fricção. É o mesmo detalhe que fez diferença na Ultra Scooter.
 * Aqui vale ainda mais: eles querem migrar o boca-a-boca pro WhatsApp.
 */
export function linkPacote(pacote: string) {
  const texto =
    `Olá! Vim pelo site. Tenho interesse no pacote *${pacote}* ` +
    `e gostaria de verificar a disponibilidade para a data do meu evento.`;
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(texto)}`;
}

export function linkGeral(
  texto = "Olá! Vim pelo site da Wave Sound e gostaria de verificar a disponibilidade para o meu evento.",
) {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(texto)}`;
}

/**
 * WhatsApp já com a DATA escolhida no calendário. Fecha o ciclo da agenda:
 * o cliente viu que o dia está livre e chega no WhatsApp com a data pronta.
 * `dataBR` no formato "DD/MM/AAAA".
 */
export function linkData(dataBR: string) {
  const texto =
    `Olá! Vim pelo site. Vi que o dia *${dataBR}* está livre na agenda ` +
    `e gostaria de verificar a disponibilidade para o meu evento nessa data.`;
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(texto)}`;
}
