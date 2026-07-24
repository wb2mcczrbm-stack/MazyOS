# Apresentação Ultra Park — v2

> Revisão feita em 21/07/2026 a partir do PDF original (`v1-original.pdf`).

## Arquivos

- `index.html` — fonte (autossuficiente: logo embutido em base64, sem dependência externa)
- `Ultra-Park-Apresentacao-v2.pdf` — PDF gerado, 11 páginas A4 retrato
- `v1-original.pdf` — versão anterior, guardada para comparação

Para regerar o PDF depois de editar o HTML:

```
cd clientes/Ultra-Park/apresentacao
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
  --no-pdf-header-footer --print-to-pdf="Ultra-Park-Apresentacao-v2.pdf" \
  "file://$PWD/index.html"
```

## O que mudou e por quê

### Conteúdo

| Mudança | Motivo |
|---|---|
| **Nova pág. 02 — "O contexto"** (mão de obra, sinistro, controle, ociosidade) | A v1 só falava da Ultra Park. Não havia nenhuma página sobre o problema de quem lê. É o que faz o síndico/administrador querer ouvir a proposta. |
| **Nova pág. 04 — "Como começa"** (visita → proposta → implantação → operação) | Reduz risco percebido. Sem isso, o leitor não sabe o que acontece se disser sim. |
| **Nova pág. 06 — "Modelos de contrato"** (administração / locação / só mão de obra) | Era a pergunta nº1 sem resposta: *como vocês cobram?* A v1 falava em "administração e terceirização" sem explicar a diferença comercial. |
| **Nova pág. 07 — "Segurança e conformidade"** | Na v1 o jurídico/contábil estava perdido como "serviço 06". Ele não é serviço — é a garantia que justifica terceirizar. Ganhou página própria com CLT, seguros, certidões. |
| **CEAGESP em destaque** (págs. 08 e 09) | 4.890 vagas estava enterrado numa lista. É a maior prova de escala que existe no material. |
| **Página "Diferenciais" removida** | Repetia "estrutura própria" e "30 anos" que já apareciam em Sobre e Números. O conteúdo foi absorvido pela pág. 03. |
| **Serviço 06 trocado** | "Suporte jurídico e contábil" saiu (virou pág. 07); entrou "Locação e exploração de áreas", que é serviço de verdade e estava só implícito. |
| **Bilíngue PT/EN cortado** | Ocupava ~40% do texto de cada página e o público é brasileiro. Se houver alvo internacional (hotel, multinacional), o certo é uma versão EN separada — não as duas línguas na mesma página. |
| **CTA reescrito** | "Solicitamos uma reunião de 30 minutos" → "Uma visita ao seu espaço e a conversa já muda". O original usava o formalismo cartorial que evitamos. |

### Design

- **Laranja da marca de volta** (`#f07c00`, tirado do próprio logo). A v1 usava dourado, que não é a cor da Ultra Park.
- **Logo vetorial na capa e no fechamento** — a v1 escrevia "Ultra Park" em Arial.
  O logo foi refeito em vetor (ver `identidade/design-guide.md`); a apresentação
  usa `ultra-park-logo-negativo.svg` embutido.
- Fundo escuro `#14110f` alternado com papel `#faf8f3`, Georgia nos títulos.
- Páginas com o conteúdo distribuído na altura útil (a v1 tinha metade inferior vazia em várias).

## Confirmar com o cliente antes de enviar

1. **Os três modelos de contrato** (pág. 06) — escrevi com base no que a v1 dizia
   ("administração e terceirização", "locação de vagas"). Confirmar se é exatamente
   assim que a Ultra Park trabalha e se a remuneração é essa.
2. **Certidões e seguros** (pág. 07) — confirmar quais coberturas e certidões
   são de fato entregues, para não prometer a mais.
3. **"Visita e proposta sem custo"** (pág. 11) — confirmar.

## O que deixaria a apresentação mais forte

Nada disso foi inventado no material — é o que falta e depende de informação real:

- ~~Página de referências com nomes de clientes.~~ **Decidido em 22/07/2026:
  não citar nomes.** A apresentação fica genérica para poder ser enviada a
  qualquer destinatário sem risco de erro. Em licitação o que vale é o edital
  de qualquer forma. *(Se um dia mudar: as pastas do iCloud não distinguem
  cliente de concorrência disputada — confirmar antes de citar qualquer nome.)*
  Único nome que permanece é o **CEAGESP**, que já constava da lista de pátios
  da v1 e é material do próprio Daniel.
- **Um case curto**: pátio antes / depois, com número de ocupação ou faturamento
- **Prazo médio de implantação** em dias
- **Foto** de um pátio em operação e da equipe uniformizada — hoje a apresentação
  é 100% tipográfica, e uma foto real muda a percepção de "empresa que existe"
- **CNPJ e tempo de registro** no rodapé do fechamento (credibilidade em licitação
  e em condomínio)
