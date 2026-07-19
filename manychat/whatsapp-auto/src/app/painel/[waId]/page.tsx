import Link from "next/link";
import { db } from "@/lib/supabase";
import { responderCliente, devolverAoBot } from "../actions";

export const dynamic = "force-dynamic";

function hora(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

// Next 16: params é assíncrono.
export default async function ThreadPage({
  params,
}: {
  params: Promise<{ waId: string }>;
}) {
  const { waId } = await params;

  const { data: contato } = await db
    .from("contacts")
    .select("wa_id, name, handed_off, state")
    .eq("wa_id", waId)
    .maybeSingle();

  const { data: mensagens } = await db
    .from("messages")
    .select("id, direction, author, body, created_at")
    .eq("wa_id", waId)
    .order("created_at", { ascending: true })
    .limit(200);

  const estado = (contato?.state ?? {}) as Record<string, string>;
  const resumo = Object.entries(estado)
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");

  return (
    <main className="min-h-screen flex flex-col bg-neutral-100">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0">
        <Link href="/painel" className="text-neutral-500 text-lg">
          ←
        </Link>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-neutral-800 truncate">
            {contato?.name ?? waId}
          </div>
          <div className="text-xs text-neutral-500 truncate">
            {waId}
            {resumo && ` · ${resumo}`}
          </div>
        </div>
        {contato?.handed_off ? (
          <form action={devolverAoBot}>
            <input type="hidden" name="wa_id" value={waId} />
            <button className="text-xs bg-neutral-200 text-neutral-700 px-2 py-1 rounded-full hover:bg-neutral-300">
              Devolver ao bot 🤖
            </button>
          </form>
        ) : (
          <span className="text-xs text-green-600">🤖 bot ativo</span>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {(mensagens ?? []).map((m) => {
          const meu = m.direction === "out";
          return (
            <div
              key={m.id}
              className={`flex ${meu ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                  meu
                    ? m.author === "human"
                      ? "bg-blue-600 text-white"
                      : "bg-green-600 text-white"
                    : "bg-white text-neutral-800 border"
                }`}
              >
                {meu && (
                  <div className="text-[10px] opacity-80 mb-0.5">
                    {m.author === "human" ? "Você" : "Bot"}
                  </div>
                )}
                {m.body}
                <div
                  className={`text-[10px] mt-0.5 ${meu ? "opacity-80" : "text-neutral-400"}`}
                >
                  {hora(m.created_at)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form
        action={responderCliente}
        className="bg-white border-t p-3 flex items-center gap-2 sticky bottom-0"
      >
        <input type="hidden" name="wa_id" value={waId} />
        <input
          name="texto"
          placeholder="Responder pelo WhatsApp…"
          autoComplete="off"
          className="flex-1 border border-neutral-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-700"
        >
          ➤
        </button>
      </form>
    </main>
  );
}
