# dados/ — importação do estoque

Arraste aqui o arquivo do inventário do cliente (dos dados das motos, **sem as
fotos** — elas entram numa segunda passada).

## Formatos que servem

- **CSV** (ideal) — `inventario.csv`
- **Excel / planilha** — `.xlsx`, `.xls` (eu converto)
- Se for pouca moto, dá até pra colar os dados no chat

## Colunas que o importador entende

Não precisa estar exatamente assim — eu adapto ao que vier. Quanto mais tiver, melhor:

`marca, modelo, ano_fabricacao, ano_modelo, km, cilindrada, cor, preco, descricao`

O que faltar vira nulo (aparece "sem foto", "cor não informada", etc.) e pode ser
completado depois pelo painel.

## Depois do arquivo aqui

1. Eu escrevo o normalizador pro formato do banco
2. Você revisa o CSV normalizado (dado de inventário vem sujo)
3. Rodo o `npm run seed` — as motos entram no Supabase e aparecem na vitrine

As **fotos** são o passo seguinte: como moram separadas dos dados, a gente decide
o caminho (upload pelo painel, ou bulk se estiverem organizadas por moto).
