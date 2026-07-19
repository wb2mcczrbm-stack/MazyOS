# Onde paramos — WhatsApp Auto (Ultra Scooter)

## ✅ Pronto e testado
- App inteiro construído (Next.js 16 + Supabase + Cloud API + IA da Claude).
- Banco Supabase conectado; `schema.sql` e `seed-ultra-scooter.sql` já rodados.
- Fluxo testado de ponta a ponta localmente (webhook → fluxo → inbox):
  oi → tipo → pagamento → link + handoff. Lead qualificado com sucesso.
- Painel (login, inbox, thread, config) renderizando.
- `.env.local` criado com segredos gerados (senha do painel, verify token, etc.).
  A senha do painel está no `.env.local` (campo PANEL_PASSWORD).

## ⏳ Pendente (retomar quando tiver o email da Meta)
1. **Meta** — criar conta em developers.facebook.com, app tipo Empresa,
   adicionar produto WhatsApp, pegar número de teste + token permanente +
   app secret. (Estávamos na Etapa 1 de 8.)
2. **Vercel** — publicar o repo com as env vars do `.env.local`
   (trocar APP_URL pelo endereço real; gerar WA_APP_SECRET real da Meta).
3. **Supabase cron** — rodar `supabase/cron.sql` com APP_URL + CRON_SECRET reais.
4. **Painel > Config** — colar access_token, phone_number_id, waba_id da Meta.
5. **Testar** de verdade mandando WhatsApp pro número de teste.

## Detalhes que ficaram em aberto
- URL do catálogo no fluxo está como `https://ultrascootergarage.com.br` —
  confirmar se é essa mesmo antes de ir ao ar (arquivo seed-ultra-scooter.sql).
- ANTHROPIC_API_KEY em branco (bot funciona só com botões até preencher).
- Número real: quando for ao vivo, precisa ser apagado do app WhatsApp normal
  primeiro (a Cloud API "toma posse" do número).

Guia completo: ver `SETUP.md`.
