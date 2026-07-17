# Briefing — Wave Sound

> Aberto em 17/07/2026. Cliente novo.

## O cliente

**Nome:** Wave Sound (marca grafada "wave.snd" no logo)
**Negócio:** Sonorização de eventos — casamentos, shows, conferências
**Modelo:** B2C/B2B de serviço, fechamento por orçamento/agendamento
**Site atual:** https://wavesnd.com.br *(existe, mas o objetivo é um "muito bom" — ou seja, refazer)*
**Endereço:** Rua Coronel Irineu Castro, 43 — Jd. Anália Franco, São Paulo/SP, 03333-050
**Contato:** (11) 99242-8118 · contato@wavesnd.com.br

## O que o site atual tem (levantado em 17/07/2026)

- **4 pacotes com preço na tela:** Som Essencial R$ 700 · Som Profissional R$ 1.300 ·
  Som Premium R$ 2.500 · Experiência Completa R$ 5.000
- Serviços: sonorização, consultoria de planejamento, instalação, suporte
- Seções: início, serviços, sobre, portfólio ("nosso trabalho"), **agendamento
  online**, feed do Instagram, contato, políticas no rodapé
- Visual: tons neutros, logo de ondas, fotos de eventos

## O que foi pedido

"Criar um site muito bom." O atual funciona mas não impressiona — a missão é um
site à altura do serviço premium que eles vendem (o pacote topo é R$ 5.000; o site
precisa justificar esse posicionamento).

## Materiais já em mãos

- **Kit oficial do logo** (by AlesonCosta2026) em `identidade/logo-kit/` — .ai,
  .pdf e 4 SVGs: 01 horizontal claro (site), 02 horizontal escuro, 03 símbolo,
  04 símbolo escuro + PNGs. Fonte: iCloud/Documents/Wave Sound.
- **Atenção:** a pasta do iCloud também tem CNPJ, contrato social e afins —
  documentos sensíveis, NÃO copiar pro repositório (ele sobe pro GitHub).

## Paralelos com o projeto Ultra Scooter (reusar o que funcionou)

- Mesma região (Anália Franco / Tatuapé) → **SEO local por bairro** de novo
- Fechamento por WhatsApp com **mensagem pré-preenchida** (pacote escolhido)
- Stack provável: Next.js + Vercel (deploy já dominado)
- Diferença-chave: aqui é **serviço com agenda**, não catálogo de produto — o
  equivalente do "estoque" é o **portfólio de eventos** e a **disponibilidade de data**

## Respostas do cliente (17/07/2026)

- **Site atual:** feio e difícil de atualizar. "Muito bom" = **harmônico e
  tecnológico, coerente com as cores do logo**.
- **Logo visto:** três ondas em vermelho vivo (um "W" de waves) sobre branco.
  Paleta do site nasce daí: vermelho + preto/branco. O PNG dos Downloads é um
  QR code, não o logo — o logo está no PDF.
- **Preços:** cliente em dúvida se mantém. Recomendação R&B: manter como
  "a partir de R$ X" (âncora que filtra lead), fechamento fino via WhatsApp.
- **Fechamento hoje:** boca a boca. Site é pra divulgação; WhatsApp pouco usado
  mas **querem migrar pra ele** → CTA de WhatsApp com mensagem pronta é prioridade.
- **Fotos:** têm POUCAS. Ver política de imagem abaixo.

## Política de imagem (importante)

Fotos geradas por IA podem entrar como **ambientação** (texturas, palco, luz,
abstrações de onda sonora) — mas **nunca como portfólio fingindo ser evento
deles**. Sonorização vende confiança; portfólio falso é o oposto e fere o
"sem promessa que não se cumpre" da R&B. As poucas fotos reais entram tratadas;
o resto do visual se resolve com direção de arte, não com evento inventado.

## Pendências com o cliente
- [ ] Fotos reais: quantas são e onde estão? (mesmo poucas, são o portfólio)
- [x] **Instagram: @wave.snd**
- [ ] Domínio wavesnd.com.br — quem controla? (registro, DNS)
- [ ] Google Business Profile existe?
- [ ] Prazo e orçamento do projeto

## Entregas previstas

- Site novo (institucional + pacotes + portfólio + captação de orçamento)

## Status da construção (17/07/2026)

- **Site construído e publicado (preview):** https://wave-sound-nu.vercel.app
  - Atenção: `wave-sound.vercel.app` (nome curto) é de OUTRA pessoa — o nosso é
    `wave-sound-nu.vercel.app`.
- **Stack:** Next.js 15, página única, **sem Supabase** (institucional, sem estoque).
  Código em `site/web/`. Deploy: `cd site/web && vercel --prod --token <token>`.
- Projeto Vercel `wave-sound` (team ultra-scooter-garage). Env `NEXT_PUBLIC_SITE_URL`.
- **Fotos:** ainda não recebidas. Portfólio é o @wave.snd por ora. Quando vierem:
  `public/trabalho/` + listar em `src/components/Trabalho.tsx` → galeria liga sozinha.
- **Domínio:** wavesnd.com.br é do Registro.br. Virada só depois do cliente aprovar.
- **Agenda digital (Google Calendar, Nível A):** o CTA "Verificar minha data" abre
  a seção "Verifique sua data" — mini-calendário que lê livre/ocupado da agenda do
  Google (só leitura, nunca escreve) e joga a data escolhida no WhatsApp. Some a
  duplicidade de reserva; a agenda da equipe vira a fonte única. Setup pendente do
  cliente: ver `CONFIGURAR-GOOGLE-AGENDA.md` (3 env vars na Vercel). Sem elas, o
  site mostra tudo livre e funciona igual.
