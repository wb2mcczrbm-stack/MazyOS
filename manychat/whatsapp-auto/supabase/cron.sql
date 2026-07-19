-- ============================================================
--  Motor sem custo: pg_cron + pg_net batem no /api/drain a cada
--  minuto pra esvaziar a fila (a Vercel Hobby não tem cron de minuto).
--
--  Rode DEPOIS de publicar na Vercel. Troque:
--    {APP_URL}     -> endereço do app, ex: https://seu-app.vercel.app
--    {CRON_SECRET} -> o mesmo valor da env CRON_SECRET
--
--  Como o WhatsApp Cloud API usa um token PERMANENTE (usuário do sistema),
--  não precisa de renovação semanal como o Instagram — por isso só há o drain.
-- ============================================================

-- remove agendamento antigo, se existir (idempotente)
select cron.unschedule('drain-whatsapp')
where exists (select 1 from cron.job where jobname = 'drain-whatsapp');

select cron.schedule(
  'drain-whatsapp',
  '* * * * *',  -- todo minuto
  $$
  select net.http_post(
    url     := '{APP_URL}/api/drain',
    headers := jsonb_build_object('Authorization', 'Bearer {CRON_SECRET}')
  );
  $$
);
