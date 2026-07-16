import { createClient as criar } from "@supabase/supabase-js";

/**
 * Cliente de LEITURA pro site público. Sem cookie, sem sessão.
 *
 * Por que existe: o client de `server.ts` chama `cookies()`, e no Next 15
 * qualquer API dinâmica força render dinâmico. Com ele, as páginas públicas
 * nunca eram cacheadas — o `export const revalidate` era ignorado, o
 * `revalidatePath()` das actions não revalidava nada, e cada visitante batia
 * direto no Postgres.
 *
 * O visitante não tem sessão nenhuma pra ler. Tirar o cookie da jogada devolve
 * ISR pras páginas públicas de graça.
 *
 * Escrita e /admin continuam usando `server.ts` — lá a sessão é o ponto.
 */
export function createPublicClient() {
  return criar(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}

/** URL pública de uma foto no bucket 'motos'. */
export function fotoUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/motos/${path}`;
}
