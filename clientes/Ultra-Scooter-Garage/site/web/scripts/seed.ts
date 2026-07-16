/**
 * Importa o inventário da loja pro Supabase.
 *
 *   npm run seed -- ../dados/inventario.csv
 *
 * O `--env-file=.env.local` está no script do package.json — o tsx NÃO carrega
 * .env sozinho, e sem isso o script morre na primeira linha achando que faltam
 * as credenciais. (Requer Node 20.6+.)
 *
 * Espera um CSV com cabeçalho. Colunas reconhecidas (as que faltarem viram null):
 *   marca, modelo, ano_fabricacao, ano_modelo, km, cilindrada, cor, preco,
 *   descricao, fotos
 *
 * `fotos` = URLs separadas por espaço ou `|`. O script baixa cada uma e sobe pro
 * bucket. Se o inventário do cliente não trouxer URL de foto, a coluna fica vazia
 * e as fotos entram depois pelo painel — ver a ressalva no plano-tecnico.md.
 *
 * O CSV normalizado deve ser REVISADO ANTES de rodar isso. Dado de inventário de
 * loja vem sujo: marca escrita de três jeitos, km com ponto e vírgula misturados,
 * ano faltando. Rodar às cegas suja o banco do cliente no dia um.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { gerarSlug } from "../src/lib/format";

const URL_SB = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL_SB || !SERVICE) {
  console.error("Faltou NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no ambiente.");
  process.exit(1);
}

const arquivo = process.argv[2];
if (!arquivo) {
  console.error("Uso: npm run seed -- caminho/do/inventario.csv");
  process.exit(1);
}

const supabase = createClient(URL_SB, SERVICE);

/** Parser de CSV que respeita aspas — o campo `descricao` quase sempre tem vírgula. */
function parseCSV(texto: string): Record<string, string>[] {
  const linhas: string[][] = [];
  let campo = "";
  let linha: string[] = [];
  let dentroDeAspas = false;

  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];

    if (dentroDeAspas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') dentroDeAspas = false;
      else campo += c;
      continue;
    }

    if (c === '"') dentroDeAspas = true;
    else if (c === ",") { linha.push(campo); campo = ""; }
    else if (c === "\n") { linha.push(campo); linhas.push(linha); linha = []; campo = ""; }
    else if (c !== "\r") campo += c;
  }
  if (campo || linha.length) { linha.push(campo); linhas.push(linha); }

  const [cabecalho, ...resto] = linhas.filter((l) => l.some((c) => c.trim()));
  if (!cabecalho) return [];

  return resto.map((l) =>
    Object.fromEntries(cabecalho.map((h, i) => [h.trim(), (l[i] ?? "").trim()])),
  );
}

/** "R$ 25.900,00" e "25900" viram 25900. Inventário de loja vem assim. */
function numero(v: string | undefined): number | null {
  if (!v) return null;
  const limpo = v.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}\b)/g, "").replace(",", ".");
  const n = Number(limpo);
  return Number.isFinite(n) ? n : null;
}

async function subirFoto(url: string, motoId: string, ordem: number) {
  const resposta = await fetch(url);
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

  const buffer = Buffer.from(await resposta.arrayBuffer());
  const nome = `${motoId}/${ordem}.jpg`;

  const { error } = await supabase.storage
    .from("motos")
    .upload(nome, buffer, { contentType: "image/jpeg", upsert: true });
  if (error) throw error;

  await supabase.from("fotos").insert({ moto_id: motoId, path: nome, ordem });
}

async function main() {
  const linhas = parseCSV(readFileSync(arquivo, "utf8"));
  console.log(`${linhas.length} linhas no CSV.\n`);

  let ok = 0;
  const falhas: string[] = [];

  for (const [i, l] of linhas.entries()) {
    const rotulo = `${l.marca} ${l.modelo}`.trim() || `linha ${i + 2}`;

    const anoFab = numero(l.ano_fabricacao);
    const anoMod = numero(l.ano_modelo) ?? anoFab;
    const preco = numero(l.preco);

    if (!l.marca || !l.modelo || !anoFab || !preco) {
      falhas.push(`${rotulo} — falta marca, modelo, ano ou preço`);
      continue;
    }

    const dados = {
      marca: l.marca,
      modelo: l.modelo,
      ano_fabricacao: anoFab,
      ano_modelo: anoMod!,
      km: numero(l.km) ?? 0,
      cilindrada: numero(l.cilindrada),
      cor: l.cor || null,
      preco,
      descricao: l.descricao || null,
      slug: gerarSlug({ marca: l.marca, modelo: l.modelo, ano_modelo: anoMod! }),
    };

    const { data: moto, error } = await supabase
      .from("motos").insert(dados).select("id").single();

    if (error) {
      falhas.push(`${rotulo} — ${error.message}`);
      continue;
    }

    const urls = (l.fotos ?? "").split(/[|\s]+/).filter((u) => u.startsWith("http"));
    for (const [ordem, url] of urls.entries()) {
      try {
        await subirFoto(url, moto.id, ordem);
      } catch (e) {
        falhas.push(`${rotulo} — foto ${ordem + 1}: ${(e as Error).message}`);
      }
    }

    ok++;
    console.log(`✓ ${rotulo} (${urls.length} fotos)`);
  }

  console.log(`\n${ok} motos importadas.`);
  if (falhas.length) {
    console.log(`\n${falhas.length} problemas:`);
    falhas.forEach((f) => console.log(`  · ${f}`));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
