// Gera uma imagem via OpenAI (gpt-image-1) e salva em PNG.
// Uso: node --env-file=.env gerar-imagem.mjs "PROMPT" saida.png [tamanho]
//   tamanho padrão: 1024x1536 (retrato, encaixa no 4:5 com cover)
import fs from "node:fs";

const [, , prompt, outPath, sizeArg] = process.argv;
const size = sizeArg || "1024x1536";
const key = process.env.OPENAI_API_KEY;

if (!key) {
  console.error("Falta OPENAI_API_KEY (rode com --env-file=.env).");
  process.exit(1);
}
if (!prompt || !outPath) {
  console.error('Uso: node --env-file=.env gerar-imagem.mjs "PROMPT" saida.png [tamanho]');
  process.exit(1);
}

const res = await fetch("https://api.openai.com/v1/images/generations", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "gpt-image-1",
    prompt,
    size,
    n: 1,
    quality: "medium", // equilíbrio custo/qualidade
  }),
});

if (!res.ok) {
  console.error("Erro da API:", res.status, await res.text());
  process.exit(1);
}

const data = await res.json();
const b64 = data?.data?.[0]?.b64_json;
if (!b64) {
  console.error("Resposta sem imagem:", JSON.stringify(data).slice(0, 400));
  process.exit(1);
}

fs.writeFileSync(outPath, Buffer.from(b64, "base64"));
console.log("salvo:", outPath, `(${size})`);
