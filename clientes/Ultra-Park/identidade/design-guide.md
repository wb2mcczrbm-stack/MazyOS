# Ultra Park — identidade

> Levantado em 21/07/2026, a partir do material original do escritório.

## O logo

Desenho **mantido igual ao original**. O que mudou foi só o formato: era um
bitmap, agora é vetor.

### Por que refizemos

O arquivo de maior resolução que existia tinha **158 × 126 pixels**. O
`logo-oficial.pdf` e o `logo-oficial.psd` são o mesmo bitmap colado numa página
A4 — não havia vetor em lugar nenhum, nem camada de texto, nem máscara vetorial.
Na prática o logo não podia ser impresso acima de ~4 cm sem serrilhar.

### Como foi reconstruído

Cada parte veio da melhor origem possível:

| Parte | Origem |
|---|---|
| Elipse | primitiva `<ellipse>` ajustada aos pixels escuros do original |
| U laranja | traçado do bitmap com separação de cor sub-pixel |
| “Ultra Park” | **Brush Script MT**, itálico, peso normal — remontado em alta resolução |
| “ESTACIONAMENTOS” | **Helvetica Bold**, tracking 0,03em — remontado em alta resolução |

As fontes foram identificadas por comparação e confirmadas por medida: a
cobertura de tinta do wordmark original é 0,300 e a do Brush Script itálico
normal é 0,292 (o **bold** dava 0,412 — por isso não é bold, apesar de parecer).
O wordmark original tem um **estiramento horizontal de 1,30×**, que foi
preservado.

Os scripts ficaram guardados: `vetorizar.py` (bitmap → SVG) e
`gerar-variantes.py` (SVG → variantes e PNGs). Rodar nessa ordem, de dentro
de `identidade/`.

## Cores

| Cor | Hex | Uso |
|---|---|---|
| Laranja Ultra | `#f07c00` | o U, destaques, títulos de seção |
| Tinta | `#1b1918` | elipse, wordmark, fundos escuros |
| Creme | `#f2eee6` | logo em fundo escuro, texto sobre escuro |

**Atenção:** a apresentação antiga usava dourado. Não é cor da marca — a cor da
Ultra Park é o laranja acima, tirado do próprio logo.

## Arquivos

### Vetor (`svg/`) — usar sempre que possível

| Arquivo | Quando usar |
|---|---|
| `ultra-park-logo.svg` | padrão, fundo claro |
| `ultra-park-logo-negativo.svg` | fundo escuro (elipse vira creme) |
| `ultra-park-logo-mono-preto.svg` | uma cor — carimbo, fax, gravação, serigrafia |
| `ultra-park-logo-mono-branco.svg` | uma cor sobre fundo escuro |
| `ultra-park-simbolo.svg` | só a marca — favicon, ícone de app, avatar |
| `ultra-park-simbolo-negativo.svg` | símbolo em fundo escuro |
| `ultra-park-simbolo-mono-preto.svg` | símbolo em uma cor |

Nas versões **mono**, o U é **vazado** da elipse (não pintado por cima). Fora da
elipse ele continua cheio. É o comportamento correto em uma cor.

### PNG (`png/`) — quando o destino não aceita SVG

`logo-2000`, `logo-600`, `logo-negativo-2000`, `logo-negativo-600`,
`simbolo-1024`, `simbolo-512`. Todos com fundo transparente.

### Originais preservados

`logo-oficial.pdf`, `logo-oficial.psd`, `logo-oficial-original.png`,
`logo-oficial-recortado.png`, `logo-variante-clara.png`, `cracha.png`.

## Regras de uso

- **Nunca reescrever “Ultra Park” em outra fonte.** Na apresentação antiga o nome
  aparecia digitado em Arial na capa. Usar sempre o arquivo do logo.
- Fundo escuro pede a versão **negativo** — o logo padrão tem elipse preta e
  some.
- Abaixo de ~40 px de largura, usar só o **símbolo**. O descritivo
  “ESTACIONAMENTOS” fecha antes disso.
- Respiro mínimo em volta: a altura da elipse ÷ 2.

## Explorações descartadas

Em `svg/exploracoes/` ficaram três direções de redesenho apresentadas em
21/07/2026 (refino do gesto, monograma UP, P de vaga) e a folha comparativa
`propostas-logo.html`. **Decisão: manter o desenho original.** Os arquivos ficam
só como registro — não usar.
