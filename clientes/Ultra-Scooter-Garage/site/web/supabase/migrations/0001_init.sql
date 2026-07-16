-- Ultra Scooter Garage — schema inicial
-- Rodar no SQL Editor do Supabase (Dashboard > SQL Editor > New query).

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type moto_status as enum ('DISPONIVEL', 'RESERVADA', 'VENDIDA');

-- ---------------------------------------------------------------------------
-- Tabela: motos
-- ---------------------------------------------------------------------------

create table motos (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,

  marca           text not null,
  modelo          text not null,
  -- Ano de fabricação e ano de modelo NÃO são a mesma coisa, e quem compra moto
  -- usada olha os dois. Juntar num campo só é erro de quem nunca comprou moto.
  ano_fabricacao  int  not null,
  ano_modelo      int  not null,
  km              int  not null default 0,
  cilindrada      int,
  cor             text,
  placa_final     text,          -- só o dígito final; placa cheia é dado sensível
  preco           numeric(10,2) not null,
  descricao       text,

  status          moto_status not null default 'DISPONIVEL',
  destaque        boolean     not null default false,

  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now(),
  vendido_em      timestamptz,

  constraint ano_fabricacao_plausivel check (ano_fabricacao between 1950 and 2100),
  constraint ano_modelo_plausivel     check (ano_modelo between 1950 and 2100),
  -- Ano de modelo é o de fabricação ou o seguinte. Nunca anterior.
  constraint ano_modelo_coerente      check (ano_modelo >= ano_fabricacao),
  constraint km_nao_negativo          check (km >= 0),
  constraint preco_positivo           check (preco > 0)
);

create index motos_status_idx    on motos (status);
create index motos_marca_idx     on motos (marca);
create index motos_preco_idx     on motos (preco);
create index motos_criado_em_idx on motos (criado_em desc);

-- Vitrine: só o que está à venda, mais recente primeiro.
create index motos_vitrine_idx on motos (criado_em desc)
  where status in ('DISPONIVEL', 'RESERVADA');

-- ---------------------------------------------------------------------------
-- Tabela: fotos
-- ---------------------------------------------------------------------------

create table fotos (
  id        uuid primary key default gen_random_uuid(),
  moto_id   uuid not null references motos (id) on delete cascade,
  path      text not null,          -- caminho no bucket 'motos'
  ordem     int  not null default 0, -- ordem 0 = capa, e a capa é o que vende
  criado_em timestamptz not null default now()
);

create index fotos_moto_id_ordem_idx on fotos (moto_id, ordem);

-- ---------------------------------------------------------------------------
-- Tabela: leads  (formulário "quero vender minha moto")
-- Entrada de estoque, não de venda. Confirmar com o cliente se aceitam trade-in.
-- ---------------------------------------------------------------------------

create table leads (
  id        uuid primary key default gen_random_uuid(),
  nome      text not null,
  telefone  text not null,
  mensagem  text,
  moto_desc text,                   -- "CB 500F 2022, 12mil km"
  origem    text,                   -- slug da moto que ele estava vendo, se veio de uma ficha
  criado_em timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- atualizado_em / vendido_em automáticos
-- ---------------------------------------------------------------------------

create or replace function touch_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em := now();

  -- Carimba a data da venda quando a moto vira VENDIDA, e limpa se voltar atrás
  -- (negócio caiu). Sem isso o vendedor teria que lembrar de preencher a data.
  --
  -- O ramo do INSERT é separado de propósito: tocar em `old` durante um INSERT
  -- pode levantar "record old is not assigned yet", e isso derrubaria TODO
  -- cadastro de moto. Essa migration roda uma vez, direto na produção do
  -- cliente — não é lugar de apostar em comportamento de borda.
  if tg_op = 'INSERT' then
    if new.status = 'VENDIDA' then
      new.vendido_em := now();
    else
      new.vendido_em := null;
    end if;
  else
    if new.status = 'VENDIDA' and old.status is distinct from 'VENDIDA' then
      new.vendido_em := now();
    elsif new.status <> 'VENDIDA' then
      new.vendido_em := null;
    end if;
  end if;

  return new;
end;
$$;

-- INSERT também: moto importada já como VENDIDA precisa da data.
create trigger motos_touch
  before insert or update on motos
  for each row execute function touch_atualizado_em();

-- ---------------------------------------------------------------------------
-- Quem é "a loja"
--
-- Autenticado NÃO é o mesmo que autorizado. O Supabase habilita signup por
-- padrão e a anon key vai no bundle do browser — se as políticas de escrita
-- confiassem em `to authenticated`, qualquer visitante criaria uma conta e
-- apagaria o estoque inteiro.
--
-- A permissão vive numa allowlist explícita, não numa configuração de dashboard
-- que alguém pode desmarcar sem perceber.
-- ---------------------------------------------------------------------------

create table lojistas (
  user_id   uuid primary key references auth.users (id) on delete cascade,
  nome      text,
  criado_em timestamptz not null default now()
);

alter table lojistas enable row level security;

create policy "lojistas: cada um se enxerga"
  on lojistas for select
  to authenticated
  using (user_id = auth.uid());

create or replace function eh_lojista()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from lojistas where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Regra: o site público LÊ. Só quem está em `lojistas` ESCREVE.
-- ---------------------------------------------------------------------------

alter table motos enable row level security;
alter table fotos enable row level security;
alter table leads enable row level security;

-- Leitura pública
create policy "motos: leitura pública"
  on motos for select
  to anon, authenticated
  using (true);

create policy "fotos: leitura pública"
  on fotos for select
  to anon, authenticated
  using (true);

-- Escrita: só a loja
create policy "motos: escrita da loja"
  on motos for all
  to authenticated
  using (eh_lojista())
  with check (eh_lojista());

create policy "fotos: escrita da loja"
  on fotos for all
  to authenticated
  using (eh_lojista())
  with check (eh_lojista());

-- Leads: qualquer visitante cria, só a loja lê.
create policy "leads: qualquer um envia"
  on leads for insert
  to anon, authenticated
  with check (true);

create policy "leads: só a loja lê"
  on leads for select
  to authenticated
  using (eh_lojista());

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('motos', 'motos', true)
on conflict (id) do nothing;

create policy "fotos: leitura pública no bucket"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'motos');

create policy "fotos: upload da loja"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'motos' and eh_lojista());

create policy "fotos: update da loja"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'motos' and eh_lojista());

create policy "fotos: delete da loja"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'motos' and eh_lojista());

-- ---------------------------------------------------------------------------
-- Depois de criar o usuário da loja (Dashboard > Authentication > Users),
-- rodar isto pra dar permissão de escrita a ele. Sem essa linha o vendedor
-- loga e não consegue cadastrar nada.
--
--   insert into lojistas (user_id, nome)
--   select id, 'Ultra Scooter Garage' from auth.users where email = 'EMAIL_DA_LOJA';
-- ---------------------------------------------------------------------------
