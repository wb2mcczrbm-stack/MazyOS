# Briefing — Hub Educar

> Aberto em 22/07/2026. Cliente novo.

## O cliente

**Nome:** Hub Educar
**Negócio:** Educação / ensino *(a definir: escola, curso, professor autônomo, reforço?)*
**Presença digital hoje:** *(a levantar)*

## O que foi pedido

Uma **plataforma web com login** para alunos, onde eles:

- Entram com **login e senha próprios** (criados por eles)
- Acessam os **PDFs das aulas** e das **lições de casa**
- Veem as **atividades / tarefas / ações de casa** publicadas
- Usam um **canal de ajuda mútua**: postam dúvidas, e as respostas dos
  professores ficam visíveis para outros alunos com a mesma dúvida

## Objetivo

Centralizar material, atividades e dúvidas num só lugar de acesso do aluno —
tirar isso de grupos de WhatsApp / e-mail solto e dar uma base organizada e
consultável.

## Escopo inicial

Uma plataforma (site com área logada). A princípio só o acesso web — app nativo,
notificações, pagamento etc. podem vir depois.

## Os três pilares (o coração do produto)

1. **Material** — download de PDFs (aulas + lições de casa)
2. **Atividades** — professores publicam tarefas/atividades; alunos consultam
3. **Ajuda mútua** — fórum de dúvidas moderado por professor (resposta visível a todos)

## Dois tipos de usuário

- **Aluno** — consome material, vê atividades, pergunta
- **Professor / admin** — sobe PDFs, publica atividades, responde dúvidas

## Direção técnica proposta (a validar)

- **Next.js + Supabase** (mesmo stack do bot Ultra Scooter):
  - Supabase **Auth** para login/senha e sessão
  - Supabase **Storage** para os PDFs
  - **RLS** (row-level security) para cada aluno ver só o que é dele
- Área do aluno + painel do professor
- Web primeiro; PWA opcional depois

## Pendências (levantar com o cliente)

**Sobre o negócio**
- O Hub Educar é uma escola, um curso, um professor autônomo, um cursinho? Quantos alunos hoje?
- Há **menores de idade** entre os alunos? (define cuidado de LGPD/consentimento)

**Sobre o produto**
- ~~**Cadastro:**~~ **Definido (22/07):** só **aluno matriculado**, via **código
  de turma que expira a cada dia**. O professor mostra o código do dia; o aluno
  se cadastra com ele e cria a própria senha. O professor vê os alunos da turma
  e pode **excluir** quem não deveria ter entrado. Sem cadastro aberto ao público.
- ~~**Turmas/matérias:**~~ **Definido (22/07):** material organizado **por turma**.
  Cada aluno pertence a uma turma e vê o material/atividades da sua turma.
  *(A princípio — confirmar se um aluno pode estar em mais de uma turma.)*
- ~~**Atividades:**~~ **Definido (22/07):** o aluno **consulta e entrega** (upload
  da resposta); o professor recebe e corrige. Vira um mini-Classroom: atividade
  tem prazo, entrega e status (pendente / entregue / corrigida). Confirmar se tem
  **nota** ou só "corrigida/visto".
- **Ajuda mútua:** qualquer aluno vê todas as dúvidas, ou só as da sua turma? Só professor responde, ou aluno também?
- Quem administra no dia a dia (sobe PDF, responde)? Quantos professores?
- Volume esperado de material (PDFs por semana) e de alunos (dimensiona storage e plano)

**Sobre identidade**
- Logo, cores, tipografia — tem algo pronto? (senão, propor)
- Nome de domínio já registrado?

**Comercial**
- Modelo: cobra dos alunos (mensalidade) ou o cliente paga tudo?
- Prazo desejado

## Protótipo navegável (22/07/2026)

Feito um protótipo clicável dos **dois lados** para mostrar ao cliente e fechar as
últimas definições em cima de algo concreto. HTML autossuficiente, sem backend,
**cores de placeholder** (identidade real ainda não existe).

- Arquivo: `plataforma/prototipo.html`
- Link compartilhável: https://claude.ai/code/artifact/afdc4f84-25a1-4efc-9864-e61fde42befc

**Cobre:**
- *Aluno:* entrar com código da turma → criar conta → material (PDFs de aulas e
  lições) → atividades (entregar / ver correção) → dúvidas da turma
- *Professor:* visão geral, **código do dia** (com "gerar novo"), lista de alunos
  com **remover** (intruso destacado), material, atividades para corrigir, responder dúvidas

## Status

Protótipo pronto para levar ao cliente. Decisões travadas: acesso só matriculado
por código diário + moderação; material por turma; atividades com entrega e
correção. **Aguardando** as respostas de negócio (escola/curso/autônomo, menores
de idade, nota vs. visto) e a definição de identidade visual.
