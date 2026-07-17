# Conectar a agenda do Google ao "Verifique sua data"

O site já tem o calendário funcionando. Enquanto **não** conectar a agenda, ele
mostra **todas as datas futuras como livres**. Depois de conectar, as datas
ocupadas aparecem bloqueadas automaticamente.

> **Método sem custo e sem cartão.** Usa o "endereço secreto no formato iCal" da
> própria agenda do Google. **NÃO precisa** de Google Cloud, conta de serviço,
> nem cartão de crédito. É só copiar **um link** e colar numa variável na Vercel.
>
> **Nível A — só leitura.** O site lê o link só no servidor e devolve apenas as
> datas; o link nunca chega ao navegador. Nunca escreve nada na agenda.

---

## Passo 1 — Criar a agenda dedicada (recomendado)

1. Em [calendar.google.com](https://calendar.google.com), ao lado de "Outras
   agendas" (menu à esquerda), clique **+ → Criar agenda**.
2. Nome: **Wave Sound — Eventos**. Criar.
3. Compartilhe com a equipe pra todos verem/editarem. É a agenda que vira a fonte
   única: **toda data de evento fechado tem que entrar aqui** (pode ser um evento
   de dia inteiro), senão o site não sabe que o dia está ocupado.

> Por que uma agenda separada? Assim o link secreto expõe só os eventos de
> trabalho, nunca a agenda pessoal de vocês.

## Passo 2 — Pegar o "endereço secreto no formato iCal"

1. Passe o mouse na agenda **Wave Sound — Eventos** → **⋮ → Configurações e
   compartilhamento**.
2. Role até **Integrar agenda**.
3. Copie o campo **"Endereço secreto no formato iCal"** — é um link que termina
   em `.ics` (algo como
   `https://calendar.google.com/calendar/ical/....../basic.ics`).

> ⚠️ Esse link é como uma senha: quem tem ele vê os eventos. Não publique em
> lugar nenhum — ele vai **só** na variável da Vercel (próximo passo). Se um dia
> vazar, nessa mesma tela dá pra **"Redefinir"** o link e gerar outro.

## Passo 3 — Colar o link na Vercel

No projeto `wave-sound` na Vercel → **Settings → Environment Variables** →
ambiente **Production**:

| Nome | Valor |
|---|---|
| `GOOGLE_CALENDAR_ICS_URL` | o link `.ics` do Passo 2 |

Depois **Redeploy** (Deployments → ⋮ no último deploy → Redeploy).
Pronto — as datas ocupadas passam a aparecer bloqueadas no site.

> Prefere que eu configure por você? Me passe só esse link `.ics` que eu ligo via
> CLI e faço o redeploy. (É um link secreto, mas dá pra "Redefinir" no Google
> depois se quiser trocar. Se preferir não colar aqui, adicione você pelo painel
> da Vercel pelo passo acima.)

## Como testar depois de configurar

1. Crie um evento de teste (dia inteiro) numa data futura na agenda.
2. Abra o site → seção **Verifique sua data** → navegue até aquele mês → o dia
   deve aparecer **riscado/bloqueado** em ~1 min (a leitura não tem cache; o
   Google atualiza o feed iCal em alguns minutos no máximo).
3. Apague o evento de teste → o dia volta a ficar livre.

---

## (Opcional) Alternativa técnica: service account

Existe um segundo caminho, via **Google Cloud + conta de serviço** (API
`freeBusy`). É mais burocrático e o console fica pedindo cartão (dá pra usar sem
ativar cobrança, mas assusta). **Não recomendo** — o método iCal acima resolve
igual, de graça e em 2 passos. O código suporta os dois; se um dia quiser o
service account, as variáveis são `GOOGLE_CALENDAR_ID`,
`GOOGLE_SERVICE_ACCOUNT_EMAIL` e `GOOGLE_SERVICE_ACCOUNT_KEY`.
