# Briefing — Ultra Scooter Garage

> Aberto em 14/07/2026. Cliente fechado (não é proposta).

## O cliente

**Nome:** Ultra Scooter Garage
**Negócio:** Compra e venda de motos
**Modelo:** B2C
**Ticket médio:** R$ 25.000 por moto
**Site hoje:** não tem. Este é o primeiro.

## O problema

Não têm presença própria na web. O estoque vive espalhado:

- **Webmotors / OLX** — onde o estoque está catalogado hoje (fonte da importação inicial)
- **Instagram / WhatsApp** — onde a conversa e o fechamento acontecem

Sem site próprio, toda a audiência é alugada. Pagam pra aparecer no
marketplace e competem por preço na mesma tela do concorrente.

## O que foi pedido

Site útil (não institucional decorativo), **fácil de atualizar com as imagens
das motos**. Referência declarada: Webmotors.

Ler a referência com cuidado — o que ele quer da Webmotors é a *vitrine
navegável* (card, filtro, ficha da moto, galeria de fotos), não o marketplace
com múltiplos vendedores. É um catálogo de uma loja só.

## Decisões já tomadas

| Decisão | Escolha |
|---|---|
| Estágio | Fechado — é pra executar |
| Atualização de estoque | **Painel admin próprio** (não CMS de mercado, não planilha) |
| Fechamento da venda | WhatsApp — o site não vende, qualifica |
| Estoque inicial | Importar de Webmotors/OLX, não digitar do zero |

## Por que painel próprio e não CMS

O vendedor precisa cadastrar moto **do celular, dentro da loja, com a moto na
frente dele**. Um CMS genérico faz ele preencher campos que não falam a língua
dele. O painel próprio fala: marca, modelo, ano, km, cilindrada, cor, preço,
fotos. Menos atrito = estoque de fato atualizado.

Efeito colateral estratégico: esse painel é o mesmo CRUD de qualquer loja de
veículo. Ver `CLAUDE.md` desse projeto.

## A pergunta do ticket

O nome é "Scooter Garage" mas o ticket médio é R$ 25 mil. Scooter de entrada não
chega perto disso. Duas hipóteses:

1. Trabalham com **maxi-scooter / premium** (Honda ADV, Yamaha XMAX, BMW C400)
2. O nome é herança e hoje vendem moto em geral

**Confirmar com o cliente.** Isso muda o vocabulário do site inteiro — se é
scooter, os filtros e a copy falam "scooter"; se é moto em geral, falam "moto".
Errar isso é errar a primeira impressão com o público dele.

## Resolvido

- **Endereço: Rua Marechal Barbacena, 823 — Tatuapé, São Paulo/SP.** Está em
  `site/web/src/lib/loja.ts`, e o **Tatuapé** é o alvo de SEO do site inteiro.
- **Logo: recebido.** Identidade extraída em `identidade/design-guide.md` e já
  aplicada no site. Marca **bicolor**: marrom escuro (`#2E1E1C`) + creme
  (`#FBF8F4`), wordmark serifado.
- **Inventário: Daniel tem acesso direto.** Não precisa raspar marketplace. Plano
  de scraping descartado — ver `site/plano-tecnico.md`.

## O que o logo resolveu (e o que ele decidiu)

O logo é sóbrio e quase editorial — não é uma marca "esportiva/agressiva". Isso
virou uma vantagem no site: **fundo escuro**, que além de ser fiel à marca faz a
foto da moto destacar. É o princípio do showroom e da revista de carro. A Webmotors
é branca porque é marketplace genérico; a loja não precisa parecer com ela.

O logo tem **duas cores e nenhuma cor de destaque**. Não inventei uma terceira: a
única cor viva do site é o verde do WhatsApp, e ela entra como cor *funcional*
(o usuário reconhece e sabe o que o botão faz), não como cor de marca. Se o cliente
quiser uma cor própria, é decisão dele.

## SEO: o Tatuapé é a jogada

"Moto usada São Paulo" é praça perdida pra Webmotors e Mercado Livre. A loja ganha
em **"scooter usada no Tatuapé"** — ninguém atravessa São Paulo pra ver uma moto, e
o marketplace rankeia mal nessa cauda longa. O bairro entra em tudo que o Google lê:

| Onde | O que o Google vê |
|---|---|
| `<h1>` da home | Scooters e motos usadas no Tatuapé. |
| Título padrão | Ultra Scooter Garage — scooters e motos usadas no Tatuapé |
| Catálogo | Scooters e motos usadas no Tatuapé |
| Ficha da moto | Honda CB 500F 2022 usada no Tatuapé — R$ 25.000 |
| JSON-LD | `AutoDealer` com `addressLocality: Tatuapé` |

**Oportunidade adjacente:** o Tatuapé faz divisa com Carrão, Água Rasa, Vila
Formosa, Anália Franco, Belém e Penha. Uma página por bairro vizinho
(`/scooter-usada-no-carrao`) captura a busca de quem mora ao lado — mas isso é
fase 2, e só vale depois que o estoque estiver no ar. Não fazer agora.

## Pendências com o cliente

- [ ] **WhatsApp comercial** — é o CTA de todas as fichas; hoje aponta pro vazio
- [ ] **Confirmar: scooter, maxi-scooter premium, ou moto em geral?** O nome diz
      scooter, o ticket de R$ 25 mil diz outra coisa. Bloqueia a copy
- [ ] **CEP** — completa o JSON-LD de `LocalBusiness`
- [ ] Versão **vetorial do logo** (SVG/AI), se existir — sem vetor, adesivo/placa/fachada travam
- [ ] Quantas motos em estoque médio (10 vs 200 muda busca, filtro, paginação)
- [ ] Domínio: já possuem? Em nome de quem? (registrar em nome do cliente, não no seu)
- [ ] O inventário exportado traz as **fotos**? Se não, a importação vira duas tarefas
- [x] **Google Business Profile — EXISTE.** Link: https://share.google/6YPsc4PUGcFMfDkmZ
      (kgmid `/g/11zcnc37z8`). Já está no site: mapa embutido + botão "Ver no Google"
      na home. Vale conferir se está reivindicado/otimizado (fotos, horário, avaliações)

## Entregas previstas

- Site público (catálogo + ficha da moto + CTA WhatsApp)
- Painel admin (login, CRUD de motos, upload de fotos pelo celular)
- Importação inicial do estoque
