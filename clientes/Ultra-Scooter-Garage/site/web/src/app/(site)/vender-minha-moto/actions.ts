"use server";

import { createPublicClient } from "@/lib/supabase/publico";

/**
 * Entrada de estoque, não de venda.
 *
 * A loja COMPRA e vende — esse formulário é a ponta de compra, e é o único canal
 * do site que gera estoque em vez de consumir. Numa loja de veículo, quem tem
 * fluxo de entrada barato ganha; quem depende de leilão paga caro.
 *
 * A RLS deixa `anon` inserir em `leads` e só a loja ler. O visitante nunca
 * enxerga o que outro visitante mandou.
 */
export async function enviarLead(form: FormData) {
  const nome = (form.get("nome") as string)?.trim();
  const telefone = (form.get("telefone") as string)?.trim();
  const moto_desc = (form.get("moto_desc") as string)?.trim();
  const mensagem = (form.get("mensagem") as string)?.trim() || null;

  if (!nome || !telefone || !moto_desc) {
    return { erro: "Preencha nome, telefone e qual é a moto." };
  }

  const supabase = createPublicClient();
  const { error } = await supabase
    .from("leads")
    .insert({ nome, telefone, moto_desc, mensagem });

  if (error) return { erro: "Não consegui enviar. Tente pelo WhatsApp." };
  return { ok: true };
}
