"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function Filtros({ marcas }: { marcas: string[] }) {
  const router = useRouter();
  const params = useSearchParams();

  function set(chave: string, valor: string) {
    const p = new URLSearchParams(params.toString());
    if (valor) p.set(chave, valor);
    else p.delete(chave);
    router.push(`/motos?${p.toString()}`);
  }

  // `bg-cafe` no <option> também: sem isso o menu nativo abre branco no Windows
  // e o texto creme fica invisível.
  const input =
    "w-full rounded-lg border border-cafe-borda bg-cafe px-3 py-2.5 text-sm text-creme focus:border-creme/60 focus:outline-none [&>option]:bg-cafe [&>option]:text-creme";

  return (
    <div className="grid gap-3 rounded-xl border border-cafe-borda bg-cafe-claro p-4 sm:grid-cols-2 lg:grid-cols-4">
      <select
        className={input}
        aria-label="Marca"
        value={params.get("marca") ?? ""}
        onChange={(e) => set("marca", e.target.value)}
      >
        <option value="">Todas as marcas</option>
        {marcas.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      <select
        className={input}
        aria-label="Preço"
        value={params.get("preco_max") ?? ""}
        onChange={(e) => set("preco_max", e.target.value)}
      >
        <option value="">Qualquer preço</option>
        <option value="15000">até R$ 15.000</option>
        <option value="25000">até R$ 25.000</option>
        <option value="40000">até R$ 40.000</option>
        <option value="70000">até R$ 70.000</option>
      </select>

      <select
        className={input}
        aria-label="Ano"
        value={params.get("ano_min") ?? ""}
        onChange={(e) => set("ano_min", e.target.value)}
      >
        <option value="">Qualquer ano</option>
        <option value="2024">2024 ou mais novo</option>
        <option value="2022">2022 ou mais novo</option>
        <option value="2020">2020 ou mais novo</option>
        <option value="2018">2018 ou mais novo</option>
      </select>

      <select
        className={input}
        aria-label="Ordenar"
        value={params.get("ordem") ?? ""}
        onChange={(e) => set("ordem", e.target.value)}
      >
        <option value="">Mais recentes</option>
        <option value="preco_asc">Menor preço</option>
        <option value="preco_desc">Maior preço</option>
        <option value="km_asc">Menor km</option>
      </select>
    </div>
  );
}
