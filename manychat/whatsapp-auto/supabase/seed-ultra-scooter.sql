-- ============================================================
--  Fluxo do Ultra Scooter Garage (roteiro aprovado)
--  Rode DEPOIS do schema.sql. Idempotente: recria o fluxo.
--
--  Caminhos:
--   • anuncio          -> cliente veio de um anúncio de moto específica
--   • inicio_organico  -> cliente chegou sem contexto (é a entrada padrão)
--   -> pagamento -> entrega_link -> handoff (link do catálogo + passa pro humano)
--
--  {saudacao} vira Bom dia/Boa tarde/Boa noite (America/Sao_Paulo) em runtime.
--  {modelo}   vira a moto do anúncio, quando o cliente vem de Click-to-WhatsApp.
--  IMPORTANTE: confirme a URL do catálogo (linkUrl) antes de ir ao ar.
-- ============================================================

delete from flows where name = 'Ultra Scooter Garage';

insert into flows (name, active, trigger_any, definition) values (
  'Ultra Scooter Garage',
  true,
  true,
  '{
    "entry": "inicio_organico",
    "nodes": {
      "anuncio": {
        "type": "buttons",
        "text": "{saudacao}! 👋 Aqui é a Ultra Scooter Garage.\nVi que você se interessou pela {modelo} 🛵 Ela está disponível! Como prefere seguir?",
        "options": [
          { "id": "anuncio_preco",    "label": "Ver preço",          "next": "pagamento" },
          { "id": "anuncio_vendedor", "label": "Falar com vendedor",  "next": "handoff" },
          { "id": "anuncio_outras",   "label": "Ver outras motos",    "next": "tipo" }
        ]
      },
      "inicio_organico": {
        "type": "buttons",
        "text": "{saudacao}! 👋 Aqui é a Ultra Scooter Garage, no Tatuapé.\nPra te ajudar rapidinho: o que você procura hoje?",
        "options": [
          { "id": "org_scooter", "label": "Scooter urbana",   "next": "pagamento", "set": { "tipo": "Scooter urbana" } },
          { "id": "org_maxi",    "label": "Maxi-scooter",      "next": "pagamento", "set": { "tipo": "Maxi-scooter" } },
          { "id": "org_tudo",    "label": "Ver tudo no site",  "next": "catalogo" }
        ]
      },
      "tipo": {
        "type": "buttons",
        "text": "Claro! Que tipo te interessa mais?",
        "options": [
          { "id": "tipo_scooter", "label": "Scooter urbana",  "next": "pagamento", "set": { "tipo": "Scooter urbana" } },
          { "id": "tipo_maxi",    "label": "Maxi-scooter",     "next": "pagamento", "set": { "tipo": "Maxi-scooter" } },
          { "id": "tipo_tudo",    "label": "Ver tudo no site", "next": "catalogo" }
        ]
      },
      "pagamento": {
        "type": "buttons",
        "text": "Show! E como você pensa em pagar?",
        "options": [
          { "id": "pag_vista", "label": "À vista",             "next": "entrega_link", "set": { "pagamento": "À vista" } },
          { "id": "pag_fin",   "label": "Financiado",          "next": "entrega_link", "set": { "pagamento": "Financiado" } },
          { "id": "pag_troca", "label": "Tenho moto na troca", "next": "entrega_link", "set": { "pagamento": "Troca" } }
        ]
      },
      "entrega_link": {
        "type": "link",
        "text": "Perfeito! 🙌 Nosso estoque completo, com fotos e preços, está aqui:",
        "linkLabel": "Ver catálogo",
        "linkUrl": "https://ultrascootergarage.com.br",
        "next": "handoff"
      },
      "catalogo": {
        "type": "link",
        "text": "Beleza! Todo o estoque, com fotos e preços, está aqui 👇",
        "linkLabel": "Ver catálogo",
        "linkUrl": "https://ultrascootergarage.com.br",
        "next": "handoff"
      },
      "handoff": {
        "type": "handoff",
        "text": "Já avisei um vendedor pra te passar as condições e a disponibilidade — ele responde por aqui em instantes! 🙌"
      }
    }
  }'::jsonb
);
