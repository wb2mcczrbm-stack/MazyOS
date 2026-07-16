# Plano técnico — Site + Painel Ultra Scooter Garage

## Stack

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | **Next.js (App Router)** | Ficha da moto precisa ser server-rendered pro Google indexar. SEO é o canal de aquisição da loja. |
| Banco | **Supabase (Postgres)** | Relacional resolve filtro por marca/ano/preço/km sem gambiarra. |
| Fotos | **Supabase Storage** | Mesmo provedor, mesma auth, upload direto do browser sem passar pelo servidor. |
| Login admin | **Supabase Auth** | 2-3 usuários. Não vale construir auth do zero. |
| Deploy | **Vercel** | Preview por branch, deploy no push. |

**Custo real:** free tier cobre o começo com folga. Quando crescer, ~US$ 25/mês
Supabase + ~US$ 20/mês Vercel. Isso entra na proposta como **mensalidade de
manutenção** — não absorver como custo seu.

## Modelo de dados

```sql
motos
  id              uuid pk
  slug            text unique      -- honda-cb-500f-2022-a1b2 (SEO)
  marca           text
  modelo          text
  ano_fabricacao  int
  ano_modelo      int              -- não são a mesma coisa, e o comprador de moto sabe disso
  km              int
  cilindrada      int
  cor             text
  preco           numeric
  descricao       text
  status          text             -- DISPONIVEL | RESERVADA | VENDIDA
  destaque        bool             -- aparece na home
  criado_em       timestamptz
  vendido_em      timestamptz

fotos
  id        uuid pk
  moto_id   uuid fk -> motos
  path      text
  ordem     int                    -- ordem 0 = capa
```

Detalhes que parecem pequenos e não são:

- **`ano_fabricacao` e `ano_modelo` separados.** Quem compra moto usada olha os
  dois. Juntar num campo só é erro de quem nunca comprou moto.
- **`status` com `RESERVADA`.** Sem isso o vendedor tira do site na hora que o
  cliente dá sinal, esquece de devolver se o negócio cair, e a moto evapora.
- **`slug` estável.** É o que o Google indexa. Não pode mudar quando o preço muda.

## Estrutura

```
/                      home — destaques + busca
/motos                 catálogo — filtro marca, ano, preço, cilindrada
/motos/[slug]          ficha — galeria, specs, CTA WhatsApp
/vender-minha-moto     formulário de entrada de estoque  ← se confirmar trade-in
/sobre                 prova social, endereço, mapa

/admin                 login
/admin/motos           lista, busca, mudar status rápido
/admin/motos/nova      cadastro + upload multi-foto
/admin/motos/[id]      editar, reordenar fotos, marcar VENDIDA
```

## O que faz esse site funcionar (e não é óbvio)

**1. CTA de WhatsApp com contexto.** Na ficha de cada moto:

```
https://wa.me/55DDDNUMERO?text=Ol%C3%A1!%20Tenho%20interesse%20na%20
Honda%20CB%20500F%202022%20(an%C3%BAncio%20%23142)
```

O vendedor abre o WhatsApp já sabendo qual moto. Sem isso ele recebe "oi" solto e
perde o lead na fricção de descobrir do que o cara está falando.

**2. Compressão de foto no cliente.** `browser-image-compression` antes do upload.
Foto de celular são 8 MB; o vendedor está no 4G da loja. Sem isso o upload falha,
ele desiste, e o painel vira software morto.

**3. Financiamento é o filtro real.** Ticket de 25 mil, B2C: quase ninguém paga à
vista. Mostrar a parcela estimada no card ("ou 48x de R$ 690") muda a percepção de
preço mais que qualquer desconto. Só precisa deixar claro que é **simulação**, não
oferta — o `preferencias.md` da raiz é explícito sobre não fazer falsa promessa,
e prometer taxa que não se sustenta é exatamente isso.

**4. SEO local.** `LocalBusiness` + `Product` em JSON-LD, e a ficha da moto com
título no formato que as pessoas de fato pesquisam:
*"Honda CB 500F 2022 usada em [cidade] — Ultra Scooter Garage"*.
É o canal mais barato de aquisição pra loja de veículo, e o marketplace não deixa
ela rankear com o próprio nome.

## Importação do estoque — RESOLVIDO, e resolveu bem

**Daniel tem acesso direto ao inventário do cliente.** Scraping está fora, e isso
é uma boa notícia maior do que parece: scraping de marketplace é frágil, quebra
quando eles mudam o HTML, e os termos de uso são uma zona cinzenta que não vale a
pena pisar por 40 motos.

Sequência nova:
1. Daniel exporta / extrai o inventário do painel do cliente (CSV, XLSX, ou o que vier)
2. Colocar o arquivo cru em `site/dados/inventario-original.<ext>`
3. Eu escrevo o normalizador → CSV no formato do schema
4. Daniel revisa o CSV normalizado — **dado de inventário de loja vem sujo**
   (marca escrita de três jeitos, km com ponto e vírgula misturados, ano faltando)
5. Seed no Supabase + upload das fotos

**Fotos são o ponto de atenção.** Se o inventário só tem os dados e as fotos estão
em outro lugar (drive, celular do vendedor, os anúncios da Webmotors), a
importação vira duas tarefas, não uma. Confirmar isso antes de estimar o prazo —
subir 40 motos × 8 fotos é trabalho real.

## SEO local — São Paulo não é uma cidade

Ver a ressalva completa no `briefing.md`. Resumo pro código:

- **Não** mirar "moto usada São Paulo" — praça perdida pra Webmotors/Mercado Livre
- **Mirar bairro/zona**: "scooter usada na Mooca", "loja de moto Santo Amaro"
- O comprador não atravessa SP pra ver uma moto — ele procura perto de casa, e é
  exatamente aí que o marketplace rankeia mal
- `LocalBusiness` no JSON-LD precisa do **endereço exato**, não da cidade
- Isso torna o "endereço da loja" uma pendência bloqueante, não um detalhe

## Ordem de execução

| # | Etapa | Entrega |
|---|---|---|
| 1 | Schema + Supabase + auth | Banco de pé, Daniel loga |
| 2 | **Admin primeiro** | Cliente já cadastra moto, mesmo sem site público |
| 3 | Catálogo + ficha | Site público lendo do banco real |
| 4 | Importação do estoque | Site nasce cheio |
| 5 | SEO, JSON-LD, sitemap, OG image | Google indexa |
| 6 | Domínio + deploy | No ar |

**Admin antes do site público, e isso é deliberado.** Assim que o painel estiver
de pé, o cliente começa a cadastrar — e o estoque cresce em paralelo ao seu
desenvolvimento. Se você fizer o site bonito primeiro, ele vai ficar pronto e
vazio, e você vai passar o último dia do projeto digitando moto.

## Status: scaffold pronto

O código está em `site/web/`. Etapas 1-3 e 5 da tabela acima estão escritas —
falta rodar. Ver `site/web/README.md` pro setup.

**A máquina do Daniel não tem Node instalado.** Nada roda até resolver isso
(o README abre com o passo). Foi por isso que o scaffold não pôde ser compilado
nem testado aqui — passou por revisão estática, não por execução.

### O que ainda bloqueia

| Bloqueia | O quê | Sem isso |
|---|---|---|
| Front | Logo + cores do cliente | O visual é um neutro placeholder deliberado (preto/branco). Trocar as vars em `globals.css @theme` cobre quase tudo |
| Copy | Scooter ou moto em geral? | O vocabulário do site inteiro fica no chute |
| SEO | Endereço exato da loja | Não existe SEO local de verdade — e ele é metade do valor da entrega |
| CTA | WhatsApp comercial | Todos os botões do site apontam pro vazio |
| Importação | Export do inventário + onde estão as fotos | O site nasce vazio |
