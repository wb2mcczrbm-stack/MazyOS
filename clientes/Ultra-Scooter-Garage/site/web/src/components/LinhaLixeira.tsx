"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { restaurarMoto, apagarDeVez } from "@/app/admin/actions";
import { preco } from "@/lib/format";
import type { MotoComFotos } from "@/lib/types";

/** Dias que faltam pra purga automática (10 dias após ir pra lixeira). */
function diasRestantes(apagadaEm: string) {
  const limite = new Date(apagadaEm).getTime() + 10 * 24 * 60 * 60 * 1000;
  const ms = limite - Date.now();
  if (ms <= 0) return "some a qualquer momento";
  const dias = Math.floor(ms / (24 * 60 * 60 * 1000));
  const horas = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  if (dias >= 1) return `some em ~${dias}d ${horas}h`;
  return `some em ~${horas}h`;
}

export function LinhaLixeira({ moto, capa }: { moto: MotoComFotos; capa: string | null }) {
  const [pendente, startTransition] = useTransition();
  const [some, setSome] = useState(false);

  function restaurar() {
    startTransition(async () => {
      const r = await restaurarMoto(moto.id);
      if (r.erro) return alert(r.erro);
      setSome(true);
    });
  }

  function apagar() {
    if (
      !confirm(
        `Apagar ${moto.marca} ${moto.modelo} DE VEZ?\n\n` +
          `Isso remove a moto e as fotos para sempre — não dá pra recuperar depois.`,
      )
    )
      return;
    startTransition(async () => {
      const r = await apagarDeVez(moto.id);
      if (r.erro) return alert(r.erro);
      setSome(true);
    });
  }

  if (some) return null;

  return (
    <div
      className={`flex items-center gap-4 rounded-xl border border-neutral-200 p-3 ${
        pendente ? "opacity-50" : ""
      }`}
    >
      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
        {capa ? (
          <Image src={capa} alt="" fill sizes="80px" className="object-cover grayscale" />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-neutral-400">
            sem foto
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">
          {moto.marca} {moto.modelo}
        </p>
        <p className="truncate text-sm text-neutral-500">{preco(moto.preco)}</p>
        {moto.apagada_em && (
          <p className="mt-0.5 text-xs text-amber-600">{diasRestantes(moto.apagada_em)}</p>
        )}
      </div>

      <button
        onClick={restaurar}
        disabled={pendente}
        className="shrink-0 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        Restaurar
      </button>
      <button
        onClick={apagar}
        disabled={pendente}
        className="shrink-0 rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-500 hover:border-red-400 hover:text-red-600 disabled:opacity-50"
      >
        Apagar de vez
      </button>
    </div>
  );
}
