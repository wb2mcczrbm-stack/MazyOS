import { createClient, fotoUrl } from "@/lib/supabase/server";
import { LinhaLixeira } from "@/components/LinhaLixeira";
import type { MotoComFotos } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function LixeiraPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("motos")
    .select("*, fotos(*)")
    .not("apagada_em", "is", null)
    .order("apagada_em", { ascending: false });

  const motos = (data ?? []) as MotoComFotos[];
  motos.forEach((m) => m.fotos.sort((a, b) => a.ordem - b.ordem));

  return (
    <>
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Lixeira</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Motos apagadas ficam aqui por 10 dias, caso o negócio caia. Depois somem
        sozinhas. Você pode restaurar ou apagar de vez a qualquer momento.
      </p>

      {motos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 p-12 text-center text-neutral-500">
          A lixeira está vazia.
        </p>
      ) : (
        <div className="space-y-2">
          {motos.map((m) => (
            <LinhaLixeira
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
