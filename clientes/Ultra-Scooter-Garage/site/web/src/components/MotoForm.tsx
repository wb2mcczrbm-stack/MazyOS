"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FotoUploader, type FotoPendente } from "./FotoUploader";
import { criarMoto, atualizarMoto } from "@/app/admin/actions";
import type { DadosMoto, MotoStatus } from "@/lib/types";

const MARCAS = [
  "Honda", "Yamaha", "Suzuki", "Kymco", "Dafra", "Piaggio", "Vespa",
  "BMW", "Kawasaki", "Shineray", "Haojue", "Outra",
];

export function MotoForm({
  id,
  inicial,
  fotosIniciais = [],
}: {
  id?: string;
  inicial?: Partial<DadosMoto>;
  fotosIniciais?: FotoPendente[];
}) {
  const router = useRouter();
  const [fotos, setFotos] = useState<FotoPendente[]>(fotosIniciais);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Limpa do bucket as fotos subidas nesta sessão, se o vendedor desistir.
  const descartarPendentes = useRef<() => Promise<void>>(async () => {});

  async function cancelar() {
    await descartarPendentes.current();
    router.back();
  }

  async function salvar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);

    const f = new FormData(e.currentTarget);
    const num = (k: string) => Number(f.get(k));
    const txt = (k: string) => (f.get(k) as string)?.trim() || null;

    // Entende o jeito brasileiro de digitar: "20.000", "20000" e "20.000,00"
    // viram 20000. O ponto é separador de milhar (não decimal), a vírgula é decimal.
    const numBR = (k: string) => {
      const s = String(f.get(k) ?? "")
        .replace(/[^\d,.-]/g, "")
        .replace(/\.(?=\d{3}(\D|$))/g, "") // tira o ponto de milhar
        .replace(",", ".");
      return Number(s);
    };

    const dados: DadosMoto = {
      marca: f.get("marca") as string,
      modelo: (f.get("modelo") as string).trim(),
      ano_fabricacao: num("ano_fabricacao"),
      ano_modelo: num("ano_modelo"),
      km: numBR("km"),
      cilindrada: f.get("cilindrada") ? num("cilindrada") : null,
      cor: txt("cor"),
      // Placa não é mais coletada (nem aparece no site). Preserva a existente na
      // edição só pra não zerar o dado interno; no cadastro novo fica null.
      placa_final: inicial?.placa_final ?? null,
      preco: numBR("preco"),
      descricao: txt("descricao"),
      status: f.get("status") as MotoStatus,
      destaque: f.get("destaque") === "on",
    };

    if (!Number.isFinite(dados.preco) || dados.preco <= 0) {
      setErro("Preço inválido. Digite só o valor — ex: 20000 ou 20.000.");
      setSalvando(false);
      return;
    }
    if (!Number.isFinite(dados.km) || dados.km < 0) {
      setErro("Quilometragem inválida. Digite só números — ex: 39000.");
      setSalvando(false);
      return;
    }

    const paths = fotos.map((x) => x.path);
    const r = id
      ? await atualizarMoto(id, dados, paths)
      : await criarMoto(dados, paths);

    if (r.erro) {
      setErro(r.erro);
      setSalvando(false);
      return;
    }

    router.push("/admin/motos");
    router.refresh();
  }

  // Inputs grandes: o vendedor preenche isso no celular, em pé, na loja.
  const campo =
    "w-full rounded-lg border border-neutral-300 px-4 py-3 text-base focus:border-neutral-900 focus:outline-none";
  const rotulo = "mb-1.5 block text-sm font-medium text-neutral-700";
  const anoAtual = new Date().getFullYear();

  return (
    <form onSubmit={salvar} className="space-y-8 pb-24">
      <section>
        <h2 className="mb-4 text-lg font-semibold">Fotos</h2>
        <FotoUploader
          fotos={fotos}
          onChange={setFotos}
          registrarDescarte={(fn) => {
            descartarPendentes.current = fn;
          }}
        />
      </section>

      <section className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <h2 className="text-lg font-semibold">A moto</h2>
        </div>

        <div>
          <label className={rotulo} htmlFor="marca">Marca</label>
          <select id="marca" name="marca" required defaultValue={inicial?.marca ?? ""} className={campo}>
            <option value="" disabled>Escolha…</option>
            {MARCAS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <label className={rotulo} htmlFor="modelo">Modelo</label>
          <input id="modelo" name="modelo" required placeholder="CB 500F"
            defaultValue={inicial?.modelo ?? ""} className={campo} />
        </div>

        {/* Fabricação e modelo separados: quem compra moto usada olha os dois. */}
        <div>
          <label className={rotulo} htmlFor="ano_fabricacao">Ano de fabricação</label>
          <input id="ano_fabricacao" name="ano_fabricacao" type="number" inputMode="numeric"
            required min={1950} max={anoAtual + 1}
            defaultValue={inicial?.ano_fabricacao ?? ""} className={campo} />
        </div>

        <div>
          <label className={rotulo} htmlFor="ano_modelo">Ano do modelo</label>
          <input id="ano_modelo" name="ano_modelo" type="number" inputMode="numeric"
            required min={1950} max={anoAtual + 2}
            defaultValue={inicial?.ano_modelo ?? ""} className={campo} />
        </div>

        <div>
          <label className={rotulo} htmlFor="km">Quilometragem</label>
          <input id="km" name="km" type="text" inputMode="numeric" required
            placeholder="39.000" defaultValue={inicial?.km ?? ""} className={campo} />
        </div>

        <div>
          <label className={rotulo} htmlFor="cilindrada">Cilindrada (cc)</label>
          <input id="cilindrada" name="cilindrada" type="number" inputMode="numeric" min={0}
            placeholder="500" defaultValue={inicial?.cilindrada ?? ""} className={campo} />
        </div>

        <div>
          <label className={rotulo} htmlFor="cor">Cor</label>
          <input id="cor" name="cor" placeholder="Preta"
            defaultValue={inicial?.cor ?? ""} className={campo} />
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <h2 className="text-lg font-semibold">Preço e status</h2>
        </div>

        <div>
          <label className={rotulo} htmlFor="preco">Preço (R$)</label>
          <input id="preco" name="preco" type="text" inputMode="numeric" required
            placeholder="20.000"
            defaultValue={inicial?.preco ?? ""} className={campo} />
          <p className="mt-1 text-xs text-neutral-500">Pode digitar com ou sem ponto: 20000 ou 20.000</p>
        </div>

        <div>
          <label className={rotulo} htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={inicial?.status ?? "DISPONIVEL"} className={campo}>
            <option value="DISPONIVEL">Disponível</option>
            <option value="RESERVADA">Reservada (cliente deu sinal)</option>
            <option value="VENDIDA">Vendida</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className={rotulo} htmlFor="descricao">Descrição</label>
          <textarea id="descricao" name="descricao" rows={5}
            placeholder="Revisões em dia, único dono, pneus novos…"
            defaultValue={inicial?.descricao ?? ""} className={campo} />
        </div>

        <label className="flex items-center gap-3 sm:col-span-2">
          <input type="checkbox" name="destaque" defaultChecked={inicial?.destaque ?? false}
            className="h-5 w-5 rounded border-neutral-300" />
          <span className="text-sm">Destacar na home</span>
        </label>
      </section>

      {erro && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{erro}</p>
      )}

      {/* Barra fixa: no celular o botão de salvar não pode sumir no scroll. */}
      <div className="fixed inset-x-0 bottom-0 border-t border-neutral-200 bg-white p-4">
        <div className="mx-auto flex max-w-5xl gap-3">
          <button type="button" onClick={cancelar} disabled={salvando}
            className="rounded-lg border border-neutral-300 px-5 py-3 font-semibold disabled:opacity-50">
            Cancelar
          </button>
          <button type="submit" disabled={salvando}
            className="flex-1 rounded-lg bg-neutral-900 px-6 py-3 font-semibold text-white disabled:opacity-50">
            {salvando ? "Salvando…" : id ? "Salvar alterações" : "Cadastrar moto"}
          </button>
        </div>
      </div>
    </form>
  );
}
