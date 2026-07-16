import { notFound } from "next/navigation";
import { createClient, fotoUrl } from "@/lib/supabase/server";
import { MotoForm } from "@/components/MotoForm";
import type { MotoComFotos } from "@/lib/types";

export default async function EditarMotoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("motos")
    .select("*, fotos(*)")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const moto = data as MotoComFotos;
  moto.fotos.sort((a, b) => a.ordem - b.ordem);

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        {moto.marca} {moto.modelo}
      </h1>
      <MotoForm
        id={moto.id}
        inicial={moto}
        fotosIniciais={moto.fotos.map((f) => ({
          path: f.path,
          preview: fotoUrl(f.path),
        }))}
      />
    </>
  );
}
