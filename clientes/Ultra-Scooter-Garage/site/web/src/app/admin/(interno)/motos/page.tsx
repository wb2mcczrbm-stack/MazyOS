import Link from "next/link";
import { createClient, fotoUrl } from "@/lib/supabase/server";
import { LinhaMoto } from "@/components/LinhaMoto";
import { preco } from "@/lib/format";
import type { MotoComFotos } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminMotosPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("motos")
    .select("*, fotos(*)")
    .is("apagada_em", null)
    .order("criado_em", { ascending: false });

  const motos = (data ?? []) as MotoComFotos[];
  motos.forEach((m) => m.fotos.sort((a, b) => a.ordem - b.ordem));

  const disponiveis = motos.filter((m) => m.status === "DISPONIVEL");
  const emEstoque = motos.filter((m) => m.status !== "VENDIDA");
  const valorEstoque = emEstoque.reduce((s, m) => s + Number(m.preco), 0);

  return (
    <>
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Cartao rotulo="Disponíveis" valor={String(disponiveis.length)} />
        <Cartao rotulo="Reservadas" valor={String(motos.filter((m) => m.status === "RESERVADA").length)} />
        <Cartao rotulo="Valor no pátio" valor={preco(valorEstoque)} />
      </div>

      {motos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 p-12 text-center">
          <p className="font-semibold">Nenhuma moto cadastrada ainda.</p>
          <p className="mt-1 text-sm text-neutral-500">
            Cadastre a primeira e ela já aparece no site.
          </p>
          <Link
            href="/admin/motos/nova"
            className="mt-6 inline-block rounded-lg bg-neutral-900 px-5 py-3 font-semibold text-white"
          >
            + Nova moto
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {motos.map((m) => (
            <LinhaMoto
              key={m.id}
              moto={m}
              capa={m.fotos[0] ? fotoUrl(m.fotos[0].path) : null}
            />
          ))}
        </div>
      )}
    </>
  );
}

function Cartao({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 p-4">
      <p className="text-xs text-neutral-500">{rotulo}</p>
      <p className="mt-1 text-xl font-bold">{valor}</p>
    </div>
  );
}
