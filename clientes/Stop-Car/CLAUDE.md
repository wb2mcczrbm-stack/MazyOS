# Stop Car

> Projeto criado em 21/07/2026. Pasta dedicada — instruções aqui sobrescrevem as
> da raiz quando relevantes.

## Sobre

Criar uma automação/app para os clientes da Stop Car agendarem lavagem e estética
automotiva com facilidade — girando em torno do serviço **leva e traz** (ele
busca o carro na casa do cliente de scooter e devolve pronto).

## Tipo

Cliente novo.

## Entregas previstas

- App/automação de agendamento (com agenda, aceite, serviços extras e observações)

## Onde salvar o que

- Briefing e contexto: `briefing.md` nessa pasta
- Código e artefatos do app: `app/`
- Identidade do cliente (logo, cores): `identidade/` *(criar quando o material chegar)*
- Proposta fechada (quando existir): `proposta.html` nessa pasta

## Contexto que herda da raiz

Herda tom de voz, marca e contexto do negócio de `_memoria/` e `identidade/` da
raiz. Não duplicar aqui.

**Atenção:** a identidade da raiz é da **Romano & Bettini**, não da Stop Car. O
app usa a identidade *do cliente* — ainda não levantada. Não inventar cor/logo
antes do material real chegar.

## Específico desse projeto

### O leva e traz É o produto

**90% dos atendimentos** são leva e traz: ele vai de scooter até a casa do
cliente, busca o veículo, leva pro serviço e devolve pronto. O app não é um
"agendador de lavagem" genérico — é um **agendador de coleta**. Todo o fluxo gira
em torno de: *quando* buscar, *onde* buscar, *o que fazer* no carro, e *quando*
devolver.

Se o produto tratar isso como detalhe, erra o alvo.

### Público premium exige sobriedade, não brilho

O cliente atende **carros premium a super premium**. Quem tem esse carro não quer
um app colorido e barulhento — quer a sensação de serviço de concierge: **clean,
discreto, preciso, com sensação de cuidado**. Menos elementos, mais respiro,
tipografia bem resolvida. Sofisticação por subtração.

Confiança importa mais que conveniência: a pessoa está entregando um carro caro
para um desconhecido levar embora.

### Sem download é requisito, não preferência

O cliente pediu explicitamente que **não seja obrigatório baixar app**. Direção:
**web app** acessível por link (compartilhável no WhatsApp), com opção de
instalar (PWA) pra quem quiser. Um link que abre e funciona vence qualquer app
de loja para esse público.

### O fluxo mínimo que precisa existir

1. Cliente abre o link, vê a **agenda/disponibilidade** dele
2. Escolhe dia/horário de **coleta** e informa endereço
3. Escolhe **serviços extras** (polimento, cera, lavagem de estofado, higienização…)
4. Escreve **observações livres** ("caprichar no interior", pedido especial)
5. **Aceite** — cliente confirma e já sabe que o carro será buscado
6. Ele (Stop Car) vê e confirma; cliente acompanha o status até a devolução

### Serviços extras são receita, não enfeite

Polimento, cera, lavagem de estofado, higienização — cada extra selecionado sobe o
ticket. Colocá-los de forma clara e desejável no fluxo (não escondidos num menu)
é decisão de produto, não de layout.

### Ativos reutilizáveis do workspace

- **Bot/infra de WhatsApp** (`/manychat/whatsapp-auto`) — já construído pro Ultra
  Scooter: webhook, fila de envio, inbox. Serve pra **notificar** o cliente
  ("saindo para buscar seu carro", "carro pronto") sem começar do zero.
- Padrão de CTA WhatsApp com mensagem pré-preenchida (Ultra Scooter / Wave Sound).
- GSAP como padrão de animação (ver `_memoria/preferencias.md`) — aqui, dosado:
  movimento discreto combina com o público premium.
