"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { gerarSlug } from "@/lib/format";
import type { DadosMoto, MotoStatus } from "@/lib/types";

const NAO_AUTORIZADO =
  "Sua conta está logada mas não tem permissão de escrita. " +
  "Peça pra incluírem seu usuário na tabela `lojistas`.";

/**
 * Toda escrita passa por aqui.
 *
 * Checa sessão E autorização. A distinção importa: as políticas de RLS exigem
 * `eh_lojista()`, e quando a RLS barra um UPDATE o PostgREST devolve 0 linhas
 * com `error === null` — ou seja, a action retornaria `{ok: true}` sem ter salvo
 * nada. O vendedor veria o status mudar na tela e o banco não mudaria.
 *
 * Falhar aqui, alto e claro, é melhor que um sucesso mentiroso.
 */
async function exigirLojista() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: lojista } = await supabase
    .from("lojistas")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return { supabase, autorizado: Boolean(lojista) };
}

function revalidarVitrine(slug?: string) {
  revalidatePath("/");
  revalidatePath("/motos");
  if (slug) revalidatePath(`/motos/${slug}`);
  revalidatePath("/admin/motos");
}

export async function criarMoto(dados: DadosMoto, fotos: string[]) {
  const { supabase, autorizado } = await exigirLojista();
  if (!autorizado) return { erro: NAO_AUTORIZADO };

  const slug = gerarSlug(dados);

  const { data: moto, error } = await supabase
    .from("motos")
    .insert({ ...dados, slug })
    .select("id, slug")
    .single();

  if (error) return { erro: error.message };

  if (fotos.length > 0) {
    const { error: erroFotos } = await supabase.from("fotos").insert(
      fotos.map((path, ordem) => ({ moto_id: moto.id, path, ordem })),
    );
    if (erroFotos) return { erro: erroFotos.message };
  }

  revalidarVitrine(moto.slug);
  return { ok: true, slug: moto.slug };
}

export async function atualizarMoto(id: string, dados: DadosMoto, fotos: string[]) {
  const { supabase, autorizado } = await exigirLojista();
  if (!autorizado) return { erro: NAO_AUTORIZADO };

  // O slug NÃO é regerado. Ele é o que o Google indexou — mudar o slug quando o
  // vendedor corrige o preço jogaria fora o ranking da página.
  const { data: moto, error } = await supabase
    .from("motos")
    .update(dados)
    .eq("id", id)
    .select("slug")
    .single();

  if (error) return { erro: error.message };

  const { data: antigas } = await supabase.from("fotos").select("path").eq("moto_id", id);

  // Reescrever as fotos é mais simples e mais correto que fazer diff na tabela:
  // a ordem importa, e o vendedor pode ter reordenado tudo.
  const { error: erroDelete } = await supabase.from("fotos").delete().eq("moto_id", id);
  if (erroDelete) return { erro: erroDelete.message };

  if (fotos.length > 0) {
    const { error: erroInsert } = await supabase
      .from("fotos")
      .insert(fotos.map((path, ordem) => ({ moto_id: id, path, ordem })));
    if (erroInsert) return { erro: erroInsert.message };
  }

  // No Storage, porém, diff é obrigatório: apagar a linha da tabela não apaga o
  // arquivo do bucket. Sem isso o bucket só cresce, e quem paga a conta é o cliente.
  const removidas = (antigas ?? [])
    .map((f) => f.path as string)
    .filter((p) => !fotos.includes(p));
  if (removidas.length > 0) {
    await supabase.storage.from("motos").remove(removidas);
  }

  revalidarVitrine(moto.slug);
  return { ok: true, slug: moto.slug };
}

/** Troca rápida de status na listagem — o vendedor faz isso do celular, correndo. */
export async function mudarStatus(id: string, status: MotoStatus) {
  const { supabase, autorizado } = await exigirLojista();
  if (!autorizado) return { erro: NAO_AUTORIZADO };

  // O `.select()` não é enfeite: sem ele, um UPDATE barrado pela RLS volta com
  // 0 linhas e `error === null`, e a action mentiria `{ok: true}`.
  const { data, error } = await supabase
    .from("motos")
    .update({ status })
    .eq("id", id)
    .select("id");

  if (error) return { erro: error.message };
  if (!data || data.length === 0) return { erro: "Nada foi salvo. " + NAO_AUTORIZADO };

  revalidarVitrine();
  return { ok: true };
}

/**
 * Manda a moto pra lixeira (soft-delete). Some do site na hora, mas continua no
 * banco por 10 dias, recuperável — caso o negócio caia. Um job diário no Supabase
 * apaga de vez o que passou do prazo. Ver supabase/migrations/0002_lixeira.sql.
 */
export async function apagarMoto(id: string) {
  const { supabase, autorizado } = await exigirLojista();
  if (!autorizado) return { erro: NAO_AUTORIZADO };

  const { data, error } = await supabase
    .from("motos")
    .update({ apagada_em: new Date().toISOString() })
    .eq("id", id)
    .is("apagada_em", null)
    .select("id");

  if (error) return { erro: error.message };
  if (!data || data.length === 0) return { erro: "Nada foi apagado. " + NAO_AUTORIZADO };

  revalidarVitrine();
  revalidatePath("/admin/lixeira");
  return { ok: true };
}

/** Tira a moto da lixeira e devolve pro estoque. */
export async function restaurarMoto(id: string) {
  const { supabase, autorizado } = await exigirLojista();
  if (!autorizado) return { erro: NAO_AUTORIZADO };

  const { data, error } = await supabase
    .from("motos")
    .update({ apagada_em: null })
    .eq("id", id)
    .select("id");

  if (error) return { erro: error.message };
  if (!data || data.length === 0) return { erro: "Não consegui restaurar. " + NAO_AUTORIZADO };

  revalidarVitrine();
  revalidatePath("/admin/lixeira");
  return { ok: true };
}

/** Apaga de vez: remove a moto e as fotos do banco E do storage. Sem volta. */
export async function apagarDeVez(id: string) {
  const { supabase, autorizado } = await exigirLojista();
  if (!autorizado) return { erro: NAO_AUTORIZADO };

  // As linhas de `fotos` caem por ON DELETE CASCADE, mas os ARQUIVOS no bucket
  // não. Colher os paths antes de apagar a moto — depois não há como descobrir.
  const { data: fotos } = await supabase.from("fotos").select("path").eq("moto_id", id);

  const { data, error } = await supabase.from("motos").delete().eq("id", id).select("id");
  if (error) return { erro: error.message };
  if (!data || data.length === 0) return { erro: "Nada foi apagado. " + NAO_AUTORIZADO };

  const paths = (fotos ?? []).map((f) => f.path as string);
  if (paths.length > 0) {
    await supabase.storage.from("motos").remove(paths);
  }

  revalidatePath("/admin/lixeira");
  return { ok: true };
}

/**
 * Fotos que o vendedor subiu e removeu ANTES de salvar já estão no bucket e não
 * têm dono. O FotoUploader chama isso na remoção pra elas não virarem lixo.
 */
export async function descartarFoto(path: string) {
  const { supabase, autorizado } = await exigirLojista();
  if (!autorizado) return { erro: NAO_AUTORIZADO };

  await supabase.storage.from("motos").remove([path]);
  return { ok: true };
}
