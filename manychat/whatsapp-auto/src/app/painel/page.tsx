import Link from "next/link";
import { db } from "@/lib/supabase";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

// Hora curta em horário de Brasília.
function hora(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function InboxPage() {
  const { data: contatos } = await db
    .from("contacts")
    .select("wa_id, name, last_inbound_at, handed_off")
    .order("last_inbound_at", { ascending: false, nullsFirst: false })
    .limit(100);

  // Última mensagem de cada conversa (uma query, monta o mapa em memória).
  const { data: msgs } = await db
    .from("messages")
    .select("wa_id, body, direction, created_at")
    .order("created_at", { ascending: false })
    .limit(400);
  const ultima: Record<string, { body: string; direction: string }> = {};
  for (const m of msgs ?? []) {
    if (!ultima[m.wa_id]) ultima[m.wa_id] = { body: m.body, direction: m.direction };
  }

  const lista = contatos ?? [];

  return (
    <main className="min-h-screen bg-neutral-100">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0">
        <div>
          <h1 className="font-semibold text-neutral-800">Atendimento</h1>
          <p className="text-xs text-neutral-500">Ultra Scooter Garage</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/painel/config" className="text-neutral-600 hover:underline">
            Configuração
          </Link>
          <form action={logout}>
            <button className="text-neutral-500 hover:underline">Sair</button>
          </form>
        </div>
      </header>

      <ul className="divide-y bg-white">
        {lista.length === 0 && (
          <li className="p-8 text-center text-neutral-500 text-sm">
            Nenhuma conversa ainda. Quando alguém mandar mensagem, aparece aqui.
          </li>
        )}
        {lista.map((c) => (
          <li key={c.wa_id}>
            <Link
              href={`/painel/${c.wa_id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50"
            >
              <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 shrink-0">
                {(c.name ?? c.wa_id).slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-800 truncate">
                    {c.name ?? c.wa_id}
                  </span>
                  {c.handed_off && (
                    <span className="text-[11px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                      🔴 você
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-500 truncate">
                  {ultima[c.wa_id]?.direction === "in" ? "" : "Você: "}
                  {ultima[c.wa_id]?.body ?? ""}
                </p>
              </div>
              <span className="text-xs text-neutral-400 shrink-0">
                {hora(c.last_inbound_at)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
