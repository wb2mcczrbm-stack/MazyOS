# Identidade — Ultra Scooter Garage

> Extraída do logo enviado pelo cliente em 14/07/2026.
> **Isto é a identidade do CLIENTE.** A da Romano & Bettini (raiz do MazyOS) não
> entra em nada aqui.

## O que o logo diz

Uma scooter em traço contínuo, branca sobre marrom escuro, com uma **asa** saindo
da carenagem traseira. Wordmark serifado, caixa alta, bem espaçado.

Três leituras que guiam o site inteiro:

1. **É uma marca bicolor.** Marrom escuro e creme. Só. Não existe cor de destaque
   no logo — e inventar uma seria colocar palavra na boca do cliente.
2. **O serifado é o tom.** Não é uma loja de moto "esportiva/agressiva" (que
   pediria itálico, vermelho, faixa diagonal). É **sóbria, quase editorial**. Isso
   é uma vantagem: no meio de anúncio de marketplace gritado, ela parece cara.
3. **A asa é o único movimento.** O resto é estático e limpo. O site deve seguir
   isso — nada de animação, gradiente ou brilho.

## Cores

> Atualizado em 15/07/2026: a pedido do cliente, os fundos deixaram de ser marrom
> e passaram a **charcoal/cinza neutro**, com a **barra do topo preta**. O creme do
> logo e o verde do WhatsApp seguem fazendo o contraste por cima.
>
> Atualizado em 16/07/2026: **logo novo** (SCOOTER ULTRA GARAGE, fonte block, com
> linha vermelha) — o mesmo da fachada física da loja. Entrou o **vermelho da
> marca `#DD132F`**, amostrado do logo: uso pontual, só a linha sob a barra preta
> (site e painel), espelhando a faixa vermelha da fachada. Não vira cor de botão —
> o CTA continua verde WhatsApp. Badge redondo = favicon + rodapé. Logo antigo
> arquivado em `identidade/logo-antigo/`. A loja **só vende scooter** — a palavra
> "moto" saiu de toda a copy do site.

| Papel | Hex | Onde |
|---|---|---|
| **Barra do topo** | `#0A0A0A` | Header do site e faixa do logo no painel — preta |
| **Fundo mais escuro** | `#161616` | Faixa do estoque, seção "onde estamos" |
| **Fundo padrão** | `#202020` | Seções padrão (hero, mapa) |
| **Superfície / cards / faixa clara** | `#2C2C2C` | Cards, motivos, rodapé |
| **Borda** | `#3D3D3D` | Divisórias, contornos de card |
| **Texto principal / marca** | `#FBF8F4` | O creme do logo. Títulos, preços |
| **Texto secundário** | `#FBF8F4` a 65% | Specs, legendas |
| **Verde WhatsApp** | `#25D366` | **Só o CTA.** Ver abaixo |

### Sobre a cor de destaque

O logo é bicolor e eu **não inventei uma terceira cor**. A única cor viva do site é
o verde do WhatsApp — e ela entra como cor **funcional**, não como cor de marca:
o usuário reconhece o verde e sabe o que o botão faz antes de ler.

Isso é uma escolha, não uma omissão. Se o cliente quiser uma cor de destaque
própria (um cobre ou âmbar quente é o vizinho natural do marrom), é decisão dele —
e aí o verde volta a ser só o WhatsApp.

**Cor proibida:** vermelho, azul, qualquer neon. Brigam com o marrom e destroem a
sobriedade que o logo construiu.

## Tipografia

| Papel | Fonte | Por quê |
|---|---|---|
| **Títulos** | Playfair Display | Serifada de alto contraste, é o que mais se aproxima do wordmark |
| **Corpo, UI, números** | Inter | Preço, km, ano e formulário precisam de legibilidade, não de personalidade |

Título em caixa alta com `letter-spacing` folgado nos lugares onde ecoa o logo
(nome da loja, títulos de seção). No corpo do texto, caixa normal — caixa alta em
parágrafo é ilegível.

## Faixas de contraste

O site não é um bloco chapado de uma cor só — alterna tons do **mesmo marrom** pra
criar ritmo sem sair da marca. Três degraus, do mais escuro ao mais claro:

- `--cafe-fundo` (#251715) — faixa do **estoque**, a mais escura, pra os cards saltarem
- `--cafe` (#2E1E1C) — faixa padrão (hero, mapa)
- `--cafe-claro` (#3A2723) — faixas de **destaque** (motivos, rodapé) e os cards

O hero ganha um brilho radial quente e sutil (`.hero-glow`) pra a maior área lisa
não parecer chapada. Regra: contraste vem de **alternar tons do marrom**, nunca de
introduzir uma cor nova.

## Fundo escuro é uma vantagem aqui

Não é só fidelidade ao logo. **Foto de veículo destaca em fundo escuro** — é por
isso que showroom e revista de carro usam preto. A Webmotors é branca porque é um
marketplace genérico; a loja não precisa parecer com ela.

A moto é o produto. O site é a moldura, e moldura escura faz o quadro aparecer.

## Regras

- **O logo nunca aparece em fundo claro** sem versão adaptada. O arquivo enviado é
  creme sobre marrom — sobre branco ele some.
- **Zero gradiente, zero sombra colorida, zero brilho.** O logo é traço puro.
- **Painel admin fica claro, não escuro.** É ferramenta, não vitrine: o vendedor
  usa no celular, na loja, muitas vezes na luz do sol. Legibilidade ganha de
  coerência de marca — a marca aparece só no cabeçalho.

## Arquivos

- `logo.png` — símbolo + wordmark *(pendente: arrastar pra essa pasta)*
- `logo-simbolo.png` — só a scooter, pro favicon e pro header mobile *(pendente)*

Pedir ao cliente a versão **vetorial (SVG/AI)** se existir. PNG serve pra web, mas
sem vetor qualquer aplicação impressa (adesivo, placa, fachada) fica travada.
