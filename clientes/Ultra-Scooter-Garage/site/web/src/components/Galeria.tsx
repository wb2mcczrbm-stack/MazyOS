"use client";

import Image from "next/image";
import { useState } from "react";
import { fotoUrl } from "@/lib/supabase/client";
import type { Foto } from "@/lib/types";

export function Galeria({ fotos, alt }: { fotos: Foto[]; alt: string }) {
  const [ativa, setAtiva] = useState(0);

  if (fotos.length === 0) {
    return (
      <div className="flex aspect-4/3 items-center justify-center rounded-xl border border-cafe-borda bg-cafe-claro text-creme/30">
        sem foto
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-4/3 overflow-hidden rounded-xl border border-cafe-borda bg-cafe-claro">
        <Image
          src={fotoUrl(fotos[ativa].path)}
          alt={`${alt} — foto ${ativa + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
        />
      </div>

      {fotos.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {fotos.map((f, i) => (
            <button
              key={f.id}
              onClick={() => setAtiva(i)}
              aria-label={`Ver foto ${i + 1}`}
              className={`relative aspect-square overflow-hidden rounded-lg border-2 transition ${
                i === ativa ? "border-creme" : "border-cafe-borda opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={fotoUrl(f.path)}
                alt=""
                fill
                sizes="20vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
