import { Suspense } from "react";
import { createPublicClient } from "@/lib/supabase/publico";
import { MotoCard } from "@/components/MotoCard";
import { Filtros } from "@/components/Filtros";
import { pracaFrase } from "@/lib/loja";
import { STATUS_VISIVEIS, type MotoComFotos } from "@/lib/types";

export const metadata = {
  title: `Scooters usadas ${pracaFrase()}`,
  description:
    "Todas as scooters disponíveis na Ultra Scooter Garage. Fotos reais, procedência conferida, atendimento no WhatsApp.",
};

// Estoque muda o dia inteiro. 60s é o suficiente pra não martelar o banco e pra
// a moto aparecer no site logo depois do vendedor cadastrar.
export const revalidate = 60;

type Busca = {
  marca?: string;
  preco_max?: string;
  ano_min?: string;
  ordem?: string;
};

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<Busca>;
}) {
  const sp = await searchParams;
  const supabase = createPublicClient();

  let q = supabase
    .from("motos")
    .select("*, fotos(*)")
    .is("apagada_em", null)
    .in("status", STATUS_VISIVEIS);

  if (sp.marca) q = q.eq("marca", sp.marca);
  if (sp.preco_max) q = q.lte("preco", Number(sp.preco_max));
  if (sp.ano_min) q = q.gte("ano_modelo", Number(sp.ano_min));

  switch (sp.ordem) {
    case "preco_asc":
      q = q.order("preco", { ascending: true });
      break;
    case "preco_desc":
      q = q.order("preco", { ascending: false });
      break;
    case "km_asc":
      q = q.order("km", { ascending: true });
      break;
    default:
      q = q.order("criado_em", { ascending: false });
  }

  const { data } = await q;
  const motos = (data ?? []) as MotoComFotos[];

  // Fotos vêm do banco sem ordem garantida. A capa (ordem 0) é o que vende —
  // ordenar aqui não é detalhe cosmético.
  motos.forEach((m) => m.fotos.sort((a, b) => a.ordem - b.ordem));

  const { data: todas } = await supabase
    .from("motos")
    .select("marca")
    .is("apagada_em", null)
    .in("status", STATUS_VISIVEIS);
  const marcas = [...new Set((todas ?? []).map((m) => m.marca as string))].sort();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="font-serif text-4xl">Estoque</h1>
      <p className="mt-2 text-creme/60">
        {motos.length} {motos.length === 1 ? "scooter disponível" : "scooters disponíveis"}
      </p>

      <div className="mt-8">
        <Suspense fallback={<div className="h-24 rounded-xl bg-cafe-claro" />}>
          <Filtros marcas={marcas} />
        </Suspense>
      </div>

      {motos.length === 0 ? (
        <p className="mt-16 text-center text-creme/50">
          Nenhuma scooter com esses filtros. Tente ampliar a busca.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {motos.map((m) => (
            <MotoCard key={m.id} moto={m} />
          ))}
        </div>
      )}

      <p className="mt-12 text-xs leading-relaxed text-creme/35">
        * Simulação de financiamento com 20% de entrada e taxa estimada de 1,99% a.m.
        Não é proposta de crédito — sujeito a análise e às condições da financeira.
      </p>
    </div>
  );
}
