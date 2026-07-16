"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { createClient, fotoUrl } from "@/lib/supabase/client";
import { descartarFoto } from "@/app/admin/actions";

export type FotoPendente = {
  path: string;
  preview: string;
};

/**
 * Upload multi-foto, mobile-first.
 *
 * Três coisas que parecem detalhe e são a diferença entre o painel ser usado e
 * ser abandonado:
 *
 * 1. COMPRESSÃO NO CLIENTE. Foto de celular moderno tem 8-12 MB. O vendedor está
 *    no 4G da loja, com a moto na frente dele. Sem comprimir, o upload de 8 fotos
 *    falha ou demora 3 minutos — ele desiste, e o estoque desatualiza.
 *
 * 2. `capture` NÃO é setado. Deixar sem `capture` permite escolher entre câmera e
 *    galeria; forçar câmera impediria subir foto já tirada, que é o caso comum.
 *
 * 3. ORDEM ARRASTÁVEL. A foto de capa é o que vende. Se o vendedor não conseguir
 *    escolher qual é a capa, ele sobe na ordem errada e o card fica feio.
 */
export function FotoUploader({
  fotos,
  onChange,
  registrarDescarte,
}: {
  fotos: FotoPendente[];
  onChange: (f: FotoPendente[]) => void;
  /** O form usa isso pra limpar o bucket se o vendedor cancelar. */
  registrarDescarte?: (descartar: () => Promise<void>) => void;
}) {
  const [enviando, setEnviando] = useState(false);
  const [progresso, setProgresso] = useState({ feito: 0, total: 0 });

  // Fotos subidas NESTA sessão do formulário. Se o vendedor sobe e remove antes
  // de salvar, o arquivo já está no bucket e nenhuma moto vai reivindicá-lo —
  // então quem apaga é aqui. As que já vieram salvas do banco não entram: quem
  // cuida delas é o diff do atualizarMoto (e um "cancelar" não deve apagar nada).
  const subidasAgora = useRef(new Set<string>());

  // Entrega ao form a chave pra limpar o bucket no "Cancelar". Sem isso, subir 8
  // fotos e desistir deixa as 8 no Storage pra sempre, sem dono, na conta do cliente.
  registrarDescarte?.(async () => {
    await Promise.all([...subidasAgora.current].map((p) => descartarFoto(p)));
    subidasAgora.current.clear();
  });

  async function subir(arquivos: FileList) {
    const supabase = createClient();
    const lista = Array.from(arquivos);

    setEnviando(true);
    setProgresso({ feito: 0, total: lista.length });

    const novas: FotoPendente[] = [];

    for (const arquivo of lista) {
      try {
        const comprimida = await imageCompression(arquivo, {
          maxSizeMB: 0.6,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: "image/webp",
        });

        const nome = `${crypto.randomUUID()}.webp`;
        const { error } = await supabase.storage
          .from("motos")
          .upload(nome, comprimida, { contentType: "image/webp", upsert: false });

        if (error) throw error;

        subidasAgora.current.add(nome);
        novas.push({ path: nome, preview: fotoUrl(nome) });
      } catch (e) {
        console.error("falha no upload de", arquivo.name, e);
        alert(`Não consegui subir a foto "${arquivo.name}". Tente de novo.`);
      }

      setProgresso((p) => ({ ...p, feito: p.feito + 1 }));
    }

    onChange([...fotos, ...novas]);
    setEnviando(false);
  }

  function remover(i: number) {
    const alvo = fotos[i];
    onChange(fotos.filter((_, idx) => idx !== i));

    if (subidasAgora.current.has(alvo.path)) {
      subidasAgora.current.delete(alvo.path);
      void descartarFoto(alvo.path);
    }
  }

  function mover(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= fotos.length) return;
    const copia = [...fotos];
    [copia[i], copia[j]] = [copia[j], copia[i]];
    onChange(copia);
  }

  return (
    <div>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 px-6 py-10 text-center transition hover:border-neutral-900">
        <span className="text-base font-semibold">
          {enviando
            ? `Enviando ${progresso.feito}/${progresso.total}…`
            : "Adicionar fotos"}
        </span>
        <span className="mt-1 text-sm text-neutral-500">
          Pode escolher várias de uma vez. A gente comprime pra você.
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={enviando}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) subir(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {fotos.length > 0 && (
        <>
          <p className="mt-4 text-sm text-neutral-500">
            {fotos.length} {fotos.length === 1 ? "foto" : "fotos"} · a primeira é a
            capa, e a capa é o que vende
          </p>

          <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {fotos.map((f, i) => (
              <div
                key={f.path}
                className="relative aspect-square overflow-hidden rounded-lg border border-neutral-200"
              >
                <Image src={f.preview} alt="" fill sizes="25vw" className="object-cover" />

                {i === 0 && (
                  <span className="absolute left-1 top-1 rounded bg-neutral-900 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    CAPA
                  </span>
                )}

                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 px-1 py-1">
                  <button
                    type="button"
                    onClick={() => mover(i, -1)}
                    disabled={i === 0}
                    aria-label="Mover pra esquerda"
                    className="px-1.5 text-white disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => remover(i)}
                    aria-label="Remover foto"
                    className="px-1.5 text-white"
                  >
                    ✕
                  </button>
                  <button
                    type="button"
                    onClick={() => mover(i, 1)}
                    disabled={i === fotos.length - 1}
                    aria-label="Mover pra direita"
                    className="px-1.5 text-white disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
