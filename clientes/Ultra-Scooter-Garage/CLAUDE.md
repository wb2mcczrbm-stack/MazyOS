# Ultra Scooter Garage

> Projeto criado em 14/07/2026. Pasta dedicada — instruções aqui sobrescrevem as
> da raiz quando relevantes.

## Sobre

Primeiro site da Ultra Scooter Garage: um catálogo de motos navegável, com painel
admin próprio pra loja cadastrar o estoque do celular. O site não fecha a venda —
qualifica o lead e joga no WhatsApp.

## Tipo

Cliente novo — **fechado**, em execução.

## Entregas previstas

- Site público — catálogo, filtros, ficha da moto, galeria, CTA WhatsApp
- Painel admin — login, CRUD de motos, upload multi-foto mobile-first
- Importação inicial do estoque a partir de Webmotors/OLX

## Onde salvar o que

- Briefing e contexto: `briefing.md` nessa pasta
- Código e artefatos do site: `site/`
- Proposta fechada (quando existir o PDF/HTML assinado): `proposta.html` nessa pasta

## Contexto que herda da raiz

Herda tom de voz, marca e contexto de negócio de `_memoria/` e `identidade/` da
raiz. Não duplicar aqui.

**Atenção:** a identidade visual da raiz é da **Romano & Bettini**, não da Ultra
Scooter Garage. Nada dela vai pro site do cliente. O site usa a identidade *do
cliente* — que ainda não foi levantada (ver pendências no `briefing.md`).

## Específico desse projeto

### O site é vitrine, não loja

Ticket de R$ 25 mil não fecha em carrinho. Ninguém digita cartão pra comprar moto.
Todo o design converge pra um único CTA: **falar com a loja no WhatsApp**.

O link de WhatsApp precisa sair da ficha da moto com a mensagem pré-preenchida:

> "Olá! Tenho interesse na Honda CB 500F 2022 (anúncio #142)."

Sem isso o vendedor recebe "oi" e não sabe de qual moto o cliente fala. Esse
detalhe vale mais pra loja que qualquer feature sofisticada.

### O painel é pro vendedor, não pro dev

Critério de aceite do admin: **um vendedor consegue cadastrar uma moto inteira,
do celular, com a moto na frente dele, em menos de 2 minutos.**

Se o fluxo não passa nesse teste, o estoque desatualiza, o site apodrece e o
cliente acha que o projeto não serviu. Mobile-first no admin não é preferência
estética — é a condição de sobrevivência do produto.

### Foto é o produto

Quem compra moto compra pela foto. Consequências não-negociáveis:

- Upload aceita múltiplas fotos de uma vez, direto da câmera
- Compressão/resize no upload — foto de celular tem 8 MB e o cliente está no 4G
- Ordem das fotos é editável (a primeira é a capa, e a capa vende)
- Nunca servir o original: gerar variantes (thumb, card, galeria)

### Estado da moto tem que existir

Moto vendida não some do banco — vira `VENDIDA`. Motivos: prova social ("já
vendemos 300"), SEO (a página continua rankeando), e histórico pro dono da loja.
Some da vitrine, permanece no sistema.

### Esse painel é um ativo, não um trabalho avulso

O CRUD de veículo é o mesmo pra loja de moto, de carro, de caminhão, de máquina
agrícola. Construir pensando em **reuso desde o primeiro commit** — o que é
específico da Ultra Scooter Garage (logo, cores, domínio, textos) fica em
configuração, não espalhado pelo código.

Isso conversa direto com o gargalo de `_memoria/estrategia.md`: um projeto que
vira produto é um orçamento que deixa de ser decisão do zero.
