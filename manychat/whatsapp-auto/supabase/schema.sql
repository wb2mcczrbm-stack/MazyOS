-- ============================================================
--  WhatsApp Auto — schema do banco (Supabase / Postgres)
--  Rode isto no SQL Editor do Supabase (uma vez).
--  Modelo de FLUXO: cada conversa é uma árvore de passos (nós)
--  com botões/listas que levam ao próximo passo. O bot também
--  entende texto livre (interpretado pela IA da Claude).
--
--  Acesso apenas pelo servidor com a service key: RLS ligado
--  em todas as tabelas, sem políticas (nada acessa pelo browser).
-- ============================================================

create extension if not exists pg_cron;   -- cron de 1 min (motor sem custo)
create extension if not exists pg_net;     -- http de dentro do Postgres

-- ------------------------------------------------------------
-- config: 1 linha, credencial da conta de WhatsApp (Cloud API)
-- ------------------------------------------------------------
create table if not exists config (
  id                   int primary key default 1 check (id = 1),
  access_token         text,           -- token permanente (system user)
  phone_number_id      text,           -- ID do número (não é o telefone)
  waba_id              text,           -- ID da conta WhatsApp Business
  display_phone_number text,           -- telefone visível
  verified_name        text,           -- nome do negócio aprovado
  notify_wa_id         text,           -- teu número: recebe aviso de lead
  token_expires_at     timestamptz,    -- null = permanente
  updated_at           timestamptz default now()
);

-- ------------------------------------------------------------
-- flows: cada fluxo é uma árvore de passos guardada em JSON.
--
--  definition (jsonb) tem o formato:
--  {
--    "entry": "saudacao",
--    "nodes": {
--      "saudacao": {
--        "type": "buttons",                 -- buttons | list | text | link | handoff
--        "text": "{saudacao} 👋 Aqui é a Ultra Scooter...",
--        "options": [
--          { "label": "Ver modelos",  "next": "modelos" },
--          { "label": "Preço",        "next": "preco" },
--          { "label": "Falar",        "next": "handoff" }
--        ]
--      },
--      "modelos": {
--        "type": "list",
--        "text": "Qual te chama mais atenção?",
--        "options": [ { "label": "Sport 150", "next": "quer_falar", "set": {"modelo":"Sport 150"} } ]
--      },
--      "handoff": { "type": "handoff", "text": "Já chamei um vendedor 🙌", "link": "..." }
--    }
--  }
--
--  {saudacao} é trocado em runtime por Bom dia/Boa tarde/Boa noite (America/Sao_Paulo).
-- ------------------------------------------------------------
create table if not exists flows (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  active          boolean not null default true,
  -- gatilho: qualquer mensagem inicia, ou só se casar palavra-chave
  trigger_any     boolean not null default true,
  keywords        text[] not null default '{}',
  match_type      text not null default 'contains'
                  check (match_type in ('contains','exact','any')),
  definition      jsonb not null default '{"entry":null,"nodes":{}}'::jsonb,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ------------------------------------------------------------
-- contacts: quem falou com você + em que passo do fluxo está
-- ------------------------------------------------------------
create table if not exists contacts (
  wa_id            text primary key,   -- número da pessoa (único)
  name             text,
  first_contact_at timestamptz default now(),
  last_inbound_at  timestamptz,        -- última msg DELA → abre janela 24h
  current_flow_id  uuid references flows(id) on delete set null,
  current_node     text,               -- chave do nó atual (null = fora do fluxo)
  state            jsonb not null default '{}'::jsonb,  -- respostas coletadas (ex: modelo)
  handed_off       boolean not null default false       -- já passou pra humano?
);

-- ------------------------------------------------------------
-- queue: fila de envio com trava atômica anti-duplicação
-- ------------------------------------------------------------
create table if not exists queue (
  id            uuid primary key default gen_random_uuid(),
  wa_id         text not null references contacts(wa_id) on delete cascade,
  flow_id       uuid references flows(id) on delete set null,
  node          text,                   -- de qual nó veio esse envio
  payload       jsonb not null,         -- corpo pronto pra Cloud API
  status        text not null default 'pending'
                check (status in ('pending','sending','sent','failed','skipped')),
  send_after    timestamptz not null default now(),  -- respeita delay
  claimed_at    timestamptz,            -- trava: quem pegou, quando
  attempts      int not null default 0,
  last_error    text,
  created_at    timestamptz default now(),
  sent_at       timestamptz
);
create index if not exists queue_drain_idx
  on queue (status, send_after) where status = 'pending';

-- ------------------------------------------------------------
-- messages: histórico da conversa (o que o INBOX do painel mostra)
-- ------------------------------------------------------------
create table if not exists messages (
  id          uuid primary key default gen_random_uuid(),
  wa_id       text not null references contacts(wa_id) on delete cascade,
  direction   text not null check (direction in ('in','out')),  -- in = cliente, out = nós
  author      text not null default 'bot'                       -- bot | human | client
              check (author in ('bot','human','client')),
  body        text,                     -- texto legível pra mostrar no inbox
  wamid       text,                     -- id da mensagem na Meta (dedupe)
  raw         jsonb,                    -- payload completo, se precisar
  created_at  timestamptz default now()
);
create index if not exists messages_thread_idx on messages (wa_id, created_at);

-- ------------------------------------------------------------
-- events: log cru de tudo que chega no webhook
-- ------------------------------------------------------------
create table if not exists events (
  id          uuid primary key default gen_random_uuid(),
  kind        text,                     -- message | status | unknown
  wa_id       text,
  raw         jsonb not null,
  created_at  timestamptz default now()
);
create index if not exists events_created_idx on events (created_at desc);

-- ============================================================
--  Trava atômica: pega até N itens prontos e marca 'sending'
--  numa transação só — dois workers nunca pegam o mesmo item.
-- ============================================================
create or replace function claim_queue(batch int)
returns setof queue
language plpgsql
as $$
begin
  return query
  update queue q
     set status = 'sending', claimed_at = now(), attempts = attempts + 1
   where q.id in (
     select id from queue
      where status = 'pending' and send_after <= now()
      order by send_after
      limit batch
      for update skip locked
   )
  returning q.*;
end;
$$;

-- ============================================================
--  RLS ligado, SEM políticas: só a service key (servidor) acessa
-- ============================================================
alter table config   enable row level security;
alter table flows    enable row level security;
alter table contacts enable row level security;
alter table queue    enable row level security;
alter table messages enable row level security;
alter table events   enable row level security;

insert into config (id) values (1) on conflict (id) do nothing;
