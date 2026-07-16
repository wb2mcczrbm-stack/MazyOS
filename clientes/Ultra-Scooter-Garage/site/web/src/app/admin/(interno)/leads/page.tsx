import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Lead = {
  id: string;
  nome: string;
  telefone: string;
  moto_desc: string | null;
  mensagem: string | null;
  criado_em: string;
};

const data = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Só dígitos: o wa.me não aceita "(11) 99999-8888".
 *
 * Decide pelo TAMANHO, não pelo prefixo "55". Um celular de Santa Maria ou
 * Uruguaiana tem DDD 55 — "(55) 99999-1234" vira "55999991234", que já "começa
 * com 55" e ficaria sem DDI, apontando pro número errado.
 * DDD (2) + celular (9) = 11 dígitos. 12 ou mais ⇒ o DDI já veio junto.
 */
const zap = (tel: string) => {
  const d = tel.replace(/\D/g, "");
  return d.length >= 12 ? d : `55${d}`;
};

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data: linhas } = await supabase
    .from("leads")
    .select("*")
    .order("criado_em", { ascending: false });

  const leads = (linhas ?? []) as Lead[];

  return (
    <>
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Motos oferecidas</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Quem preencheu o formulário &quot;quero vender minha moto&quot;. É entrada de
        estoque — responder rápido é o que ganha a moto do concorrente.
      </p>

      {leads.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 p-12 text-center text-neutral-500">
          Ninguém ofereceu moto ainda.
        </p>
      ) : (
        <div className="space-y-3">
          {leads.map((l) => (
            <div key={l.id} className="rounded-xl border border-neutral-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold">{l.nome}</p>
                  <p className="text-sm text-neutral-500">{l.moto_desc}</p>
                </div>
                <span className="shrink-0 text-xs text-neutral-400">
                  {data.format(new Date(l.criado_em))}
                </span>
              </div>

              {l.mensagem && (
                <p className="mt-3 whitespace-pre-line text-sm text-neutral-700">
                  {l.mensagem}
                </p>
              )}

              <a
                href={`https://wa.me/${zap(l.telefone)}?text=${encodeURIComponent(
                  `Olá ${l.nome}! Vi que você ofereceu a ${l.moto_desc} no nosso site. Podemos avaliar?`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Responder no WhatsApp · {l.telefone}
              </a>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
