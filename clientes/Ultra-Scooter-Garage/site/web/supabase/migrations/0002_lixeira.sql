-- Lixeira com retenção de 10 dias.
-- Apagar uma moto = marcar `apagada_em`. Ela some do site na hora, mas fica
-- recuperável por 10 dias. Um job diário limpa o que passou desse prazo.
-- Rodar no SQL Editor do Supabase.

-- 1. coluna do soft-delete
alter table motos add column if not exists apagada_em timestamptz;

-- só o que NÃO está na lixeira precisa de índice pra listagem rápida
create index if not exists motos_ativas_idx
  on motos (criado_em desc)
  where apagada_em is null;

-- 2. purga automática após 10 dias (pg_cron)
create extension if not exists pg_cron;

-- remove agendamento anterior, se houver (deixa a migration re-executável)
select cron.unschedule('purgar-motos-apagadas')
where exists (select 1 from cron.job where jobname = 'purgar-motos-apagadas');

-- roda todo dia às 03:00 UTC: apaga de vez as motos na lixeira há mais de 10 dias
-- e limpa os registros de foto no storage junto (o CTE faz as duas coisas).
select cron.schedule(
  'purgar-motos-apagadas',
  '0 3 * * *',
  $$
    with purgadas as (
      delete from motos
      where apagada_em is not null
        and apagada_em < now() - interval '10 days'
      returning id
    )
    delete from storage.objects
    where bucket_id = 'motos'
      and (string_to_array(name, '/'))[1] in (select id::text from purgadas);
  $$
);
