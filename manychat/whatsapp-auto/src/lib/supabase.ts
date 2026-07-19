import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente ADMIN (service key) — só servidor, ignora RLS. NUNCA importar em
// código de browser ("use client").
//
// Inicialização PREGUIÇOSA: a checagem das variáveis só acontece no primeiro
// uso real, não no import — assim o `next build` não quebra por falta de env.
let cliente: SupabaseClient | null = null;

function conectar(): SupabaseClient {
  if (cliente) return cliente;
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Faltam SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente.",
    );
  }
  cliente = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cliente;
}

// Proxy: adia a conexão pro primeiro acesso a `db.<algo>`.
export const db = new Proxy({} as SupabaseClient, {
  get(_alvo, prop) {
    const c = conectar();
    const v = (c as unknown as Record<string | symbol, unknown>)[prop];
    return typeof v === "function" ? (v as (...a: unknown[]) => unknown).bind(c) : v;
  },
});
