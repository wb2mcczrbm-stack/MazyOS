# Hub Educar

> Projeto criado em 22/07/2026. Pasta dedicada — instruções aqui sobrescrevem as
> da raiz quando relevantes.

## Sobre

Plataforma de estudos onde alunos entram com login e senha próprios para acessar
os PDFs das aulas e das lições de casa, ver as atividades/tarefas publicadas, e
usar um canal de ajuda mútua (dúvidas respondidas por professores, visíveis para
os demais alunos).

## Tipo

Cliente novo.

## Entregas previstas

- Plataforma web (site com login) — alunos acessam material e atividades

## Onde salvar o que

- Briefing e contexto: `briefing.md` nessa pasta
- Código da plataforma: `plataforma/`
- Identidade do cliente (logo, cores): `identidade/` *(criar quando o material chegar)*
- Proposta fechada (quando existir): `proposta.html` nessa pasta

## Contexto que herda da raiz

Herda tom de voz, marca e contexto do negócio de `_memoria/` e `identidade/` da
raiz. Não duplicar aqui.

**Atenção:** a identidade da raiz é da **Romano & Bettini**, não do Hub Educar. A
plataforma usa a identidade *do cliente* — ainda não levantada. Não inventar
cor/logo antes do material real chegar.

## Específico desse projeto

### Não é site institucional — é plataforma com conta

O produto não é uma vitrine. O núcleo é o **acesso autenticado**: cada aluno tem
login/senha próprios e, ao entrar, vê o que é dele (material, atividades,
dúvidas). Isso muda tudo em relação aos outros projetos do workspace (que são
sites/landing). Aqui existe **cadastro, sessão, permissão e dado por usuário** —
é aplicação, não página.

### Os três pilares do que o aluno faz lá dentro

1. **Material** — baixar os PDFs das aulas e das lições de casa.
2. **Atividades** — ver tarefas/ações de casa que os professores publicam **e
   entregar** a resposta (upload). Cada atividade tem prazo e um status por aluno:
   pendente → entregue → corrigida. O professor recebe e corrige. *(É um
   mini-Classroom, não só um mural de avisos. Definido 22/07.)*
3. **Ajuda mútua** — postar dúvidas; a resposta do professor fica visível para
   todos os alunos com a mesma dúvida. É um fórum de perguntas moderado por
   professor, não chat livre entre alunos.

Se um desses pilares for tratado como detalhe, erra o alvo.

### Existem dois tipos de usuário

- **Aluno** — acessa material, faz/vê atividades, pergunta.
- **Professor/admin** — sobe PDFs, publica atividades, responde dúvidas.

O painel do professor é tão parte do produto quanto a área do aluno — sem ele,
alguém teria que subir conteúdo "por fora". Levantar no briefing quem administra.

### Decisões já tomadas (22/07/2026)

- **Acesso fechado — só aluno matriculado.** Cadastro **não** é aberto: o
  professor/admin libera ou convida. Ninguém entra sozinho. O "login e senha
  criado por eles" que o cliente pediu vira: o aluno **define a própria senha**,
  mas só depois de ser habilitado pelo professor (pré-cadastro ou convite).
- **Material por turma.** Cada aluno pertence a uma turma e vê o material e as
  atividades **da sua turma**. É o eixo do modelo de dados: `turma` no centro,
  `aluno`, `material`, `atividade` e `dúvida` pendurados nela.

### Fluxo de entrada na turma — definido (22/07/2026)

**Código de turma com validade diária + moderação do professor.**

- O professor gera/mostra um **código da turma** que o aluno usa para se cadastrar.
- O código **expira a cada dia** (rotaciona: vale só no dia; no dia seguinte é
  outro). Reduz a janela de quem consegue entrar com um código vazado.
- O professor vê a **lista de alunos da turma** e pode **excluir** qualquer um —
  rede de segurança caso um não-matriculado entre com o código do dia.

Implicações de produto:
- O código do dia precisa aparecer no **painel do professor** (ele lê e passa pra
  turma presencialmente / no grupo). Pensar em como ele é gerado: derivado da
  data + segredo da turma, ou sorteado e guardado por dia.
- A tela do professor de "alunos da turma" tem ação de **remover** (e idealmente
  marcar como bloqueado, pra não reentrar no mesmo dia).
- Entrar com o código é **pedido de acesso aceito na hora**, mas revogável — não
  é aprovação prévia. O ônus de tirar o intruso é do professor (por isso o
  excluir tem que ser fácil e visível).

- **Aluno em mais de uma turma?** A princípio uma turma por aluno. Confirmar.
- **Ativos reutilizáveis do workspace:** o stack Next.js + Supabase já usado no
  bot do Ultra Scooter (`/manychat/whatsapp-auto`) serve de base — Supabase tem
  **auth pronto** (login/senha, sessão, RLS por usuário) e **storage** pra os
  PDFs. O "só matriculado + por turma" mapeia direto em **RLS por turma**: a
  política do banco garante que o aluno só lê linhas da turma dele. Não começar
  autenticação nem permissão do zero.

### LGPD desde o dia 1

São dados de estudantes (possivelmente menores). Cadastro, senha e conteúdo
pedem cuidado com consentimento e proteção — tratar como requisito, não como
"depois". Levantar com o cliente se há menores de idade.
