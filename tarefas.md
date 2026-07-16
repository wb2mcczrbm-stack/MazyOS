# Tarefas

> Pipeline, prazos e próximos passos.

## Agora

- [ ] **Ultra Scooter Garage** — site + painel de estoque (cliente fechado, em execução)
  - [x] Scaffold do site + painel admin (`clientes/Ultra-Scooter-Garage/site/web/`)
  - [x] Identidade aplicada — marrom + creme, serifada (`identidade/design-guide.md`)
  - [ ] **Instalar Node nessa máquina** — não tem, e nada roda sem ele
  - [ ] Copiar `logo.png` e `logo-simbolo.png` pra `site/web/public/`
  - [x] Bairro: **Tatuapé** — é o alvo de SEO do site inteiro
  - [x] Logos renomeados em `public/` (logo.png + logo-simbolo.png)
  - [x] Node 22 instalado + `npm install` + **build passa limpo** + dev server roda
  - [x] Next atualizado 15.1 → 15.5.20 (CVE crítica corrigida)
  - [x] Supabase criado (projeto `bmyuwvlospfydqxlmgog`, região SP), migration rodada, `insert into lojistas` feito
  - [x] `.env.local` preenchido com chaves reais + WhatsApp `5511940550480`
  - [x] Site **conectado e funcionando** — vitrine, filtros, ficha, catálogo (3 motos de teste)
  - [x] Ajustes de layout: faixas de contraste alternadas, "Nosso estoque", seção
        de localização com mapa do Google + horário (Seg–Sex 9–18, Sáb 9–13)
  - [x] Avaliações: cliente decidiu **não colocar** por enquanto (componente removido)
  - [x] Estoque real importado do export da Webmotors (13 scooters) + demos apagadas
  - [x] Confirmado: **é loja de scooter** (todas "Scooter" no export)
  - [x] 54 fotos subidas e **curadas** (capa de corpo inteiro, cards e painéis fora)
  - [x] Google Business Profile confirmado + mapa/horário no site
  - [ ] **Teste de aceite real:** Daniel loga em /admin/login e cadastra/edita uma moto
        — exercita o caminho autenticado + RLS que o service_role não testou
  - [x] **PUBLICADO na Vercel** → https://ultra-scooter-garage.vercel.app (projeto `ultra-scooter-garage`)
  - [x] Token da Vercel revogado após os deploys
  - [x] Campo de preço/km aceita formato BR ("20.000"); placa fora do site e do formulário
  - [x] Lixeira de 10 dias (soft-delete + Restaurar + purga automática via pg_cron, job id 2)
  - [ ] Teste de aceite: Daniel loga em /admin e apaga/restaura/edita uma moto (caminho RLS)
  - [ ] Toques finais pelo painel: descrição por moto, marcar destaques
  - [x] **Domínio próprio no ar:** https://ultrascooters.com.br (Registro.br: A @ → 76.76.21.21;
        Vercel emitiu HTTPS/Let's Encrypt; www e apex funcionando)
  - [x] Paleta trocada pra preto (barra) + charcoal/cinza; placa fora do site e do form
  - [x] www.ultrascooters.com.br redireciona (308) pro apex — os dois acessam, apex é o canônico
  - [ ] Revogar o token da Vercel (o de agora, do redirect)
  - [ ] (futuro) Ligar o deploy a um repo Git pra publicar automático a cada mudança de código

## Ambiente / como republicar
- Node em `~/.local/nodejs`. Deploy: `cd clientes/Ultra-Scooter-Garage/site/web && vercel --prod --token <novo-token>`
- Projeto Vercel `ultra-scooter-garage` (team_Wxd88ipN7hgA0OxBCkH1VEJU). Supabase ref `bmyuwvlospfydqxlmgog`.
- Mudança de estoque (painel) NÃO precisa de deploy — o site revalida sozinho.
  - [ ] Exportar o inventário e confirmar **se as fotos vêm junto** — muda o prazo
  - [ ] `npm run seed` com o CSV revisado
- [ ] Definir faixas de preço por tipo de entrega (site, app, CRM) — destrava o gargalo de orçamento
- [ ] Rodar `/mapear-rotinas` pra transformar prospecção e orçamento em skills

## Depois

- [ ] Preencher `identidade/design-guide.md`
- [ ] Formalizar o nome Romano & Bettini
