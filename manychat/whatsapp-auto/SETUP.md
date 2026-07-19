# WhatsApp Auto — guia de setup

Substituto do ManyChat para o Ultra Scooter Garage: um chatbot de WhatsApp que
qualifica o lead (com botões + IA) e, no fim, entrega o link do catálogo e passa
a conversa pra um humano no **inbox do painel** (mesmo número).

## Stack
Next.js 16 + Tailwind (Vercel) · Supabase (Postgres) · WhatsApp Cloud API (Meta) ·
IA da Claude para entender texto livre.

## Ordem de instalação

1. **Supabase**
   - Rode `supabase/schema.sql` no SQL Editor (cria as tabelas, RLS ligado).
   - Rode `supabase/seed-ultra-scooter.sql` (cria o fluxo do Ultra Scooter).
   - Em Project Settings > API, copie `Project URL` e a `service_role key`.

2. **Variáveis de ambiente** (copie `.env.local.example` → `.env.local` local,
   e cadastre as mesmas na Vercel):
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - `WA_APP_SECRET`, `WA_VERIFY_TOKEN` (você inventa o verify token)
   - `ANTHROPIC_API_KEY` (opcional; sem ela o bot só entende os botões)
   - `CRON_SECRET`, `PANEL_PASSWORD` (você inventa)
   - `APP_URL` (o endereço final na Vercel)
   - `CLAUDE_MODEL` (opcional; `claude-haiku-4-5` corta custo)

3. **Vercel** — importe o repositório, cadastre as env vars, faça o deploy.

4. **Supabase cron** — rode `supabase/cron.sql` trocando `{APP_URL}` e
   `{CRON_SECRET}` (drena a fila a cada minuto).

5. **Meta (developers.facebook.com)** — app tipo Empresa, produto WhatsApp:
   - Pegue o `App secret` → env `WA_APP_SECRET`.
   - Webhook: URL `{APP_URL}/api/webhook`, verify token = `WA_VERIFY_TOKEN`,
     assine o campo **messages**.
   - Pegue o número de teste grátis; gere um token permanente (usuário do sistema).
   - No painel do app (`{APP_URL}/painel` → Configuração), cole `access_token`,
     `phone_number_id` e `waba_id`.
   - Publique o app (precisa das URLs `/privacidade` e `/exclusao-de-dados`).

6. **Testar** — mande WhatsApp pro número de teste de outra conta e acompanhe a
   conversa chegar no inbox do painel.

## Rotas
- `/painel` — inbox de atendimento (protegido por `PANEL_PASSWORD`)
- `/painel/config` — credenciais do WhatsApp
- `/api/webhook` — recebe eventos da Meta
- `/api/drain` — worker de envio (chamado pelo pg_cron)
- `/privacidade`, `/exclusao-de-dados` — exigidas pela Meta
