"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { mudarStatus, apagarMoto } from "@/app/admin/actions";
import { anos, km as fmtKm, preco } from "@/lib/format";
import type { MotoComFotos, MotoStatus } from "@/lib/types";

const CORES: Record<MotoStatus, string> = {
  DISPONIVEL: "bg-green-100 text-green-800",
  RESERVADA: "bg-amber-100 text-amber-800",
  VENDIDA: "bg-neutral-200 text-neutral-600",
};

export function LinhaMoto({ moto, capa }: { moto: MotoComFotos; capa: string | null }) {
  const [status, setStatus] = useState(moto.status);
  const [pendente, startTransition] = useTransition();

  function trocar(novo: MotoStatus) {
    const anterior = status;
    setStatus(novo); // otimista — o vendedor está com pressa
    startTransition(async () => {
      const r = await mudarStatus(moto.id, novo);
      if (r.erro) {
        setStatus(anterior); // desfaz o otimismo: o banco não mudou
        alert(r.erro);
      }
    });
  }

  function apagar() {
    if (
      !confirm(
        `Mandar ${moto.marca} ${moto.modelo} pra lixeira?\n\n` +
          `Ela sai do site na hora, mas fica recuperável por 10 dias caso o negócio caia.`,
      )
    )
      return;
    startTransition(async () => {
      const r = await apagarMoto(moto.id);
      if (r.erro) alert(r.erro);
    });
  }

  return (
    <div
      className={`flex items-center gap-4 rounded-xl border border-neutral-200 p-3 ${
        pendente ? "opacity-60" : ""
      }`}
    >
      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
        {capa ? (
          <Image src={capa} alt="" fill sizes="80px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-neutral-400">
            sem foto
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <Link href={`/admin/motos/${moto.id}`} className="block truncate font-semibold hover:underline">
          {moto.marca} {moto.modelo}
        </Link>
        <p className="truncate text-sm text-neutral-500">
          {anos(moto)} · {fmtKm(moto.km)} · {preco(moto.preco)}
        </p>
      </div>

      {/* Mudar status sem abrir a moto: é o que o vendedor mais faz, e faz correndo. */}
      <select
        value={status}
        onChange={(e) => trocar(e.target.value as MotoStatus)}
        disabled={pendente}
        aria-label="Status"
        className={`shrink-0 rounded-lg border-0 px-3 py-1.5 text-xs font-semibold ${CORES[status]}`}
      >
        <option value="DISPONIVEL">Disponível</option>
        <option value="RESERVADA">Reservada</option>
        <option value="VENDIDA">Vendida</option>
      </select>

      <button
        onClick={apagar}
        disabled={pendente}
        aria-label="Apagar"
        className="shrink-0 px-2 text-neutral-400 hover:text-red-600"
      >
        ✕
      </button>
    </div>
  );
}
