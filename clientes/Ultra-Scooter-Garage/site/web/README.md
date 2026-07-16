# Ultra Scooter Garage — site + painel

Next.js 15 (App Router) · Supabase (Postgres + Storage + Auth) · Tailwind 4.

## Antes de tudo: instalar o Node

Essa máquina **não tem Node instalado**. Sem ele nada aqui roda.

```sh
# Homebrew (também não está instalado)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

brew install node
node -v   # confirmar 20+
```

Alternativa sem Homebrew: baixar o instalador em https://nodejs.org (LTS).

## Setup

**1. Criar o projeto no Supabase** — https://supabase.com/dashboard, região
`South America (São Paulo)`. Latência importa: o cliente e os visitantes estão em SP.

**2. Rodar a migration** — Dashboard → SQL Editor → New query → colar
`supabase/migrations/0001_init.sql` inteiro → Run.

Isso cria as tabelas, os índices, as políticas de RLS e o bucket `motos`.

**3. Criar o usuário da loja** — Dashboard → Authentication → Users → Add user.
Marcar **Auto Confirm User** (senão o Supabase manda e-mail de confirmação e o
vendedor trava no primeiro login).

**3b. Autorizar esse usuário** — sem isso ele loga e não consegue cadastrar nada.
SQL Editor:

```sql
insert into lojistas (user_id, nome)
select id, 'Ultra Scooter Garage' from auth.users where email = 'EMAIL_DA_LOJA';
```

A permissão de escrita vem da tabela `lojistas`, não do fato de estar logado.
Isso é de propósito: o Supabase habilita signup por padrão e a anon key vai no
bundle do browser — se bastasse "estar autenticado", um visitante criaria conta e
apagaria o catálogo. Recomendo desligar o signup também
(Authentication → Providers → Email → desmarcar **Enable signup**), mas agora é
cinto *e* suspensório, não a única linha de defesa.

**4. Variáveis de ambiente**

```sh
cp .env.local.example .env.local
```

Preencher com Project Settings → API. O `NEXT_PUBLIC_WHATSAPP` é só dígitos,
com DDI e DDD: `5511999998888`.

**5. Rodar**

```sh
npm install
npm run dev
```

- Site: http://localhost:3000
- Painel: http://localhost:3000/admin

## Rotas

| Rota | O que é |
|---|---|
| `/` | Home — destaques + CTA |
| `/motos` | Catálogo com filtros |
| `/motos/[slug]` | Ficha da moto — galeria, specs, WhatsApp. É a página que o Google indexa |
| `/vender-minha-moto` | Formulário de compra. A loja compra e vende — essa é a ponta de entrada de estoque |
| `/admin/motos` | Estoque: lista, troca de status, CRUD |
| `/admin/leads` | Motos oferecidas pelo formulário, com botão de responder no WhatsApp |

## Importar o inventário

```sh
npm run seed -- ../dados/inventario.csv
```

**Revise o CSV antes.** Dado de inventário de loja vem sujo — marca escrita de
três jeitos, km com ponto e vírgula misturados, ano faltando. O script avisa o
que não conseguiu importar, mas não conserta o que importou errado.

Colunas: `marca, modelo, ano_fabricacao, ano_modelo, km, cilindrada, cor, preco,
descricao, fotos` (fotos = URLs separadas por espaço ou `|`).

## Deploy

Vercel → importar o repo → colar as env vars → deploy.
`NEXT_PUBLIC_SITE_URL` precisa ser o domínio final em produção (o sitemap e as
tags OpenGraph dependem dele).

## Identidade

Marrom escuro (`#2E1E1C`) + creme (`#FBF8F4`), do logo. Títulos em Playfair
Display (ecoa o wordmark serifado), corpo em Inter. Tokens em
`src/app/globals.css` (`@theme`) — não há hex espalhado pelo código.

**Site público é escuro, painel admin é claro.** Não é inconsistência: o site é
vitrine (fundo escuro faz a foto da moto destacar, princípio de showroom), o painel
é ferramenta (o vendedor usa no celular, na loja, no sol). Detalhe em
`../../identidade/design-guide.md`.

### FALTA: os arquivos do logo

Copiar de `../../identidade/` pra `public/`:

- `public/logo.png` — símbolo + wordmark (header do site e do painel)
- `public/logo-simbolo.png` — só a scooter (rodapé, favicon)

Sem eles o build passa, mas **três imagens quebram em silêncio** no site. Ver
`public/LEIA-ME.md`.

## O que ainda está com placeholder

| O quê | Onde | Destrava com |
|---|---|---|
| **Bairro** | `src/lib/loja.ts` | Perguntar ao cliente. Sem ele o SEO cai pra "São Paulo", que é briga perdida pra Webmotors |
| Arquivos do logo | `public/` | Copiar de `identidade/` |
| Número do WhatsApp | `.env.local` | WhatsApp comercial |
| Vocabulário (moto vs scooter) | copy do site | Confirmar o que eles vendem de fato |
| CEP | `src/lib/loja.ts` | Completa o JSON-LD de `LocalBusiness` |

## Decisões que parecem detalhe e não são

- **`ano_fabricacao` e `ano_modelo` separados** — quem compra moto usada olha os dois.
- **Status `RESERVADA`** — sem ele o vendedor tira a moto do site quando o cliente
  dá sinal, esquece de devolver se o negócio cai, e a moto evapora do estoque.
- **Moto `VENDIDA` não some do banco nem do sitemap** — a página continua rankeando
  e vira prova social. Some da vitrine, permanece no Google.
- **Compressão de foto no browser** — foto de celular tem 8 MB e o vendedor está no
  4G da loja. Sem comprimir, o upload falha, ele desiste, e o painel vira software
  morto.
- **WhatsApp com mensagem pré-preenchida** — sem isso o vendedor recebe "oi" e não
  sabe de qual moto o cliente fala.
- **RLS ligado desde o primeiro dia** — a anon key vai no browser. Sem RLS, qualquer
  visitante apagaria o estoque inteiro.
- **Slug nunca é regerado no update** — é o que o Google indexou. Mudar o slug
  quando o preço muda jogaria fora o ranking da página.
- **Escrita gated por `lojistas`, não por "está logado"** — autenticado não é
  autorizado. Ver passo 3b.
- **Fotos removidas saem do bucket** — apagar a linha da tabela não apaga o
  arquivo. Sem o `.remove()` o bucket só cresce e a conta é do cliente.
- **Leitura pública usa `lib/supabase/publico.ts`, não `server.ts`** — o
  `server.ts` chama `cookies()`, e uma API dinâmica no Next 15 força render
  dinâmico. Usá-lo nas páginas públicas mataria o ISR sem ninguém perceber: o
  `revalidate` viraria enfeite e todo visitante bateria no Postgres.
- **Toda action de escrita checa `lojistas` e confere linhas afetadas** — quando a
  RLS barra um UPDATE, o PostgREST devolve 0 linhas com `error === null`. Sem o
  `.select()`, a action responderia `{ok: true}` sem ter salvo nada: o vendedor
  veria o status mudar na tela e o banco não mudaria. Sucesso mentiroso é pior
  que erro.

## Dívida conhecida

**Foto órfã por aba fechada.** O painel apaga do bucket as fotos que o vendedor
sobe e depois remove, e também as que ficam pendentes se ele clicar em Cancelar.
Mas se ele fechar a aba no meio do cadastro, os arquivos ficam no Storage sem
nenhuma linha em `fotos` apontando pra eles.

Não vale resolver no código (o `beforeunload` não garante a chamada). A saída é
uma varredura periódica:

```sql
-- Fotos no bucket que nenhuma moto reivindica.
select o.name
from storage.objects o
left join fotos f on f.path = o.name
where o.bucket_id = 'motos' and f.id is null
  and o.created_at < now() - interval '1 day';
```

Rodar de vez em quando (ou virar um cron job no Supabase) e apagar o que voltar.
O `interval '1 day'` evita apagar foto de um cadastro em andamento.
