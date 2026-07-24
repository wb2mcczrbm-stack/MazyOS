# Briefing — Stop Car

> Aberto em 21/07/2026. Cliente novo.

## O cliente

**Nome:** Stop Car
**Negócio:** Lavagem de carro e estética automotiva em geral
**Público:** Carros **premium a super premium** — ticket alto
**Operação:** Solo/enxuta — ele mesmo faz a coleta de scooter

## O modelo de operação (o ponto central)

**~90% dos atendimentos são no sistema "leva e traz":** ele vai de scooter até a
casa do cliente, busca o veículo, executa o serviço e devolve pronto.

Isso define o produto: não é um agendador de lavagem, é um **agendador de coleta
domiciliar**.

## O que foi pedido

Uma automação ou app para os clientes agendarem o atendimento com mais facilidade.

### Requisitos citados pelo cliente

- **Não obrigar a baixar app.** Pode ser um link compartilhável (web app) —
  ex.: link com a agenda dele; o cliente dá o **aceite** e já sabe que em breve o
  carro será buscado.
- **Agenda visível** com a disponibilidade dele.
- **Campo de observações livre** — ex.: "quero que limpe melhor a parte interna",
  pedidos de serviço extra fora do padrão.
- **Serviços extras selecionáveis** no próprio app:
  - Polimento
  - Aplicação de cera
  - Lavagem de estofado
  - Higienização
  - *(lista a fechar com o cliente)*

### Estética

**Clean, mas passando a sensação premium/super premium.** Sobriedade e cuidado —
nada de visual chamativo. Sensação de concierge, não de app de serviço barato.

## Direção técnica proposta (a validar)

- **Web app** por link (funciona sem instalar), com PWA opcional pra instalar
- Dois lados: **cliente** (agenda, extras, observações, acompanha) e
  **Stop Car** (disponibilidade, confirmação, status dos atendimentos)
- **Notificações por WhatsApp** — dá pra reaproveitar a infra já construída em
  `/manychat/whatsapp-auto`

## Pendências (levantar com o cliente)

- Identidade visual: logo, cores, tipografia — tem algo pronto?
- **Lista e preços** dos serviços (base + extras)
- Como funciona a **agenda** hoje: quantos carros por dia? janelas de horário?
  quanto tempo leva cada serviço?
- **Raio de atendimento** (bairros/cidade) — limita quem pode agendar
- Precisa de **pagamento no app** ou cobra na entrega?
- Precisa de **cadastro/login** do cliente ou o link basta?
- O cliente quer histórico de atendimentos por cliente (fidelização)?
- Volume atual de atendimentos por semana (dimensiona o produto)

## Status

Briefing aberto. Aguardando definição de escopo e material do cliente.
