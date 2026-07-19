import Link from "next/link";
import { db } from "@/lib/supabase";
import { salvarConfig } from "../actions";

export const dynamic = "force-dynamic";

const CAMPOS: { nome: string; label: string; dica: string; secreto?: boolean }[] = [
  {
    nome: "access_token",
    label: "Access token (permanente)",
    dica: "Token do usuário do sistema, gerado no painel da Meta.",
    secreto: true,
  },
  {
    nome: "phone_number_id",
    label: "Phone number ID",
    dica: "ID do número (não é o telefone). Fica em WhatsApp > API Setup.",
  },
  {
    nome: "waba_id",
    label: "WhatsApp Business Account ID",
    dica: "ID da conta comercial do WhatsApp.",
  },
  {
    nome: "display_phone_number",
    label: "Telefone visível",
    dica: "Ex: +55 11 9XXXX-XXXX (só pra referência).",
  },
  {
    nome: "verified_name",
    label: "Nome do negócio",
    dica: "Nome aprovado pela Meta (só pra referência).",
  },
  {
    nome: "notify_wa_id",
    label: "Seu número (avisos de lead)",
    dica: "Opcional. Formato internacional só com dígitos, ex: 5511999998888.",
  },
];

export default async function ConfigPage() {
  const { data: config } = await db
    .from("config")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  const base = process.env.APP_URL ?? "https://SEU-APP.vercel.app";

  return (
    <main className="min-h-screen bg-neutral-100">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0">
        <Link href="/painel" className="text-neutral-500 text-lg">
          ←
        </Link>
        <h1 className="font-semibold text-neutral-800">Configuração</h1>
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-6">
        <section className="bg-white rounded-xl p-4 text-sm space-y-2">
          <h2 className="font-medium text-neutral-800">Dados pra Meta</h2>
          <p className="text-neutral-600">
            URL do webhook:{" "}
            <code className="bg-neutral-100 px-1 rounded break-all">
              {base}/api/webhook
            </code>
          </p>
          <p className="text-neutral-600">
            Verify token: use o valor de <code>WA_VERIFY_TOKEN</code> das variáveis
            de ambiente.
          </p>
        </section>

        <form action={salvarConfig} className="bg-white rounded-xl p-4 space-y-4">
          {CAMPOS.map((c) => (
            <div key={c.nome}>
              <label className="block text-sm font-medium text-neutral-700">
                {c.label}
              </label>
              <input
                name={c.nome}
                type={c.secreto ? "password" : "text"}
                defaultValue={(config as any)?.[c.nome] ?? ""}
                placeholder={c.secreto ? "••••••••" : ""}
                className="mt-1 w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
              />
              <p className="text-xs text-neutral-500 mt-1">{c.dica}</p>
            </div>
          ))}
          <button
            type="submit"
            className="w-full bg-neutral-900 text-white rounded-lg py-2 font-medium hover:bg-neutral-800"
          >
            Salvar
          </button>
        </form>
      </div>
    </main>
  );
}
