import Image from "next/image";
import Link from "next/link";
import { fotoUrl } from "@/lib/supabase/publico";
import { anos, km as fmtKm, parcela, preco, titulo } from "@/lib/format";
import type { MotoComFotos } from "@/lib/types";

export function MotoCard({ moto }: { moto: MotoComFotos }) {
  const capa = moto.fotos[0];
  const p = parcela(moto.preco);

  return (
    <Link
      href={`/motos/${moto.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-cafe-borda bg-cafe-claro transition hover:border-creme/40"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-cafe">
        {capa ? (
          <Image
            src={fotoUrl(capa.path)}
            alt={titulo(moto)}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-creme/30">
            sem foto
          </div>
        )}

        {moto.status === "RESERVADA" && (
          <span className="absolute left-3 top-3 rounded-full bg-creme px-3 py-1 text-xs font-semibold text-cafe">
            Reservada
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-lg leading-tight">
          {moto.marca} {moto.modelo}
        </h3>
        <p className="mt-1.5 text-sm text-creme/50">
          {anos(moto)} · {fmtKm(moto.km)}
          {moto.cilindrada ? ` · ${moto.cilindrada}cc` : ""}
        </p>

        <div className="mt-auto pt-5">
          <p className="text-xl font-semibold">{preco(moto.preco)}</p>
          {/* Parcela é o número que o comprador de fato compara num ticket de 25 mil.
              O asterisco leva ao aviso de simulação — nunca promessa de taxa. */}
          <p className="mt-0.5 text-xs text-creme/45">
            ou {p.meses}x de {preco(p.valor)}*
          </p>
        </div>
      </div>
    </Link>
  );
}
