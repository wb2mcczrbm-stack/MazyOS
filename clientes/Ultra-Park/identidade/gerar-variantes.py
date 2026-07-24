"""Gera as variantes do logo a partir do SVG vetorizado."""
import re
import subprocess
import base64

BASE = '/Users/danielromano/MazyOS/clientes/Ultra-Park/identidade'
SVG = f'{BASE}/svg'
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
TMP = ('/private/tmp/claude-501/-Users-danielromano-MazyOS/'
       '39a13db4-2b42-4896-a171-8ab6cc922405/scratchpad')

LARANJA, TINTA, CREME = '#f07c00', '#1b1918', '#f2eee6'
base = open(f'{SVG}/ultra-park-logo.svg').read()

# a elipse define a caixa do simbolo
m = re.search(r'<ellipse cx="([\d.]+)" cy="([\d.]+)" rx="([\d.]+)" ry="([\d.]+)"', base)
cx, cy, rx, ry = (float(g) for g in m.groups())
x0, y0 = cx - rx, cy - ry
sw, sh = rx * 2, ry * 2


def escrever(nome, texto):
    open(f'{SVG}/{nome}.svg', 'w').write(texto)
    return f'{nome}.svg'


def recolorir(texto, de_para):
    for de, para in de_para.items():
        texto = texto.replace(f'fill="{de}"', f'fill="{para}"')
    return texto


def so_simbolo(texto):
    """Mantem elipse e U, corta o wordmark, reenquadra no simbolo."""
    linhas = [l for l in texto.split('\n')
              if '<ellipse' in l or f'fill="{LARANJA}"' in l or '<svg' in l
              or '</svg>' in l or '<title>' in l]
    s = '\n'.join(linhas)
    s = re.sub(r'viewBox="[^"]*"', f'viewBox="{x0:.2f} {y0:.2f} {sw:.2f} {sh:.2f}"', s)
    s = re.sub(r'width="\d+" height="\d+"',
               f'width="{int(sw*10)}" height="{int(sh*10)}"', s)
    return s


gerados = []
gerados.append(('ultra-park-logo.svg', 'principal — fundo claro'))
gerados.append((escrever('ultra-park-logo-negativo',
                         recolorir(base, {TINTA: CREME})), 'fundo escuro'))
def elipse_path():
    """A elipse como path, para poder combinar com o U num unico contorno."""
    return (f'M {cx-rx:.2f} {cy:.2f} '
            f'a {rx:.2f} {ry:.2f} 0 1 0 {rx*2:.2f} 0 '
            f'a {rx:.2f} {ry:.2f} 0 1 0 {-rx*2:.2f} 0 Z')


def mono(texto, cor):
    """Em uma cor o U tem de ser vazado da elipse (evenodd), nao pintado por cima.
    Fora da elipse ele continua sendo tinta — que e' o que o evenodd ja resolve."""
    d_u = re.search(rf'<path fill="{re.escape(LARANJA)}" d="([^"]+)"', texto).group(1)
    d_wm = re.findall(rf'<path fill="{re.escape(TINTA)}" d="([^"]+)"', texto)
    cabeca = texto.split('<ellipse')[0]
    corpo = [f'  <path fill="{cor}" d="{elipse_path()} {d_u}"/>']
    corpo += [f'  <path fill="{cor}" d="{d}"/>' for d in d_wm]
    return cabeca + '\n'.join(corpo) + '\n</svg>'


gerados.append((escrever('ultra-park-logo-mono-preto', mono(base, TINTA)),
                'uma cor — preto'))
gerados.append((escrever('ultra-park-logo-mono-branco', mono(base, CREME)),
                'uma cor — branco'))
gerados.append((escrever('ultra-park-simbolo', so_simbolo(base)), 'símbolo isolado'))
gerados.append((escrever('ultra-park-simbolo-negativo',
                         so_simbolo(recolorir(base, {TINTA: CREME}))),
                'símbolo — fundo escuro'))
def simbolo_mono(cor):
    """So o primeiro path do mono (elipse + U vazado), reenquadrado."""
    d_u = re.search(rf'<path fill="{re.escape(LARANJA)}" d="([^"]+)"', base).group(1)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" '
            f'viewBox="{x0:.2f} {y0:.2f} {sw:.2f} {sh:.2f}" '
            f'width="{int(sw*10)}" height="{int(sh*10)}" fill-rule="evenodd">\n'
            f'  <title>Ultra Park</title>\n'
            f'  <path fill="{cor}" d="{elipse_path()} {d_u}"/>\n</svg>')

gerados.append((escrever('ultra-park-simbolo-mono-preto', simbolo_mono(TINTA)),
                'símbolo — uma cor'))

# exportacoes PNG com fundo transparente
def png(svg_nome, largura, saida):
    html = (f'<!doctype html><meta charset="utf-8">'
            f'<style>html,body{{margin:0;background:transparent}}'
            f'img{{display:block;width:{largura}px}}</style>'
            f'<img src="file://{SVG}/{svg_nome}">')
    open(f'{TMP}/exp.html', 'w').write(html)
    subprocess.run([CHROME, '--headless', '--disable-gpu', '--hide-scrollbars',
                    '--default-background-color=00000000',
                    f'--window-size={largura},{largura}',
                    f'--screenshot={TMP}/exp.png', f'file://{TMP}/exp.html'],
                   capture_output=True)
    from PIL import Image
    im = Image.open(f'{TMP}/exp.png').convert('RGBA')
    bb = im.split()[3].getbbox()
    im.crop(bb).save(saida)
    return im.crop(bb).size


import os
os.makedirs(f'{BASE}/png', exist_ok=True)
for nome, larg, saida in [
    ('ultra-park-logo.svg', 2000, f'{BASE}/png/logo-2000.png'),
    ('ultra-park-logo.svg', 600, f'{BASE}/png/logo-600.png'),
    ('ultra-park-logo-negativo.svg', 2000, f'{BASE}/png/logo-negativo-2000.png'),
    ('ultra-park-logo-negativo.svg', 600, f'{BASE}/png/logo-negativo-600.png'),
    ('ultra-park-simbolo.svg', 1024, f'{BASE}/png/simbolo-1024.png'),
    ('ultra-park-simbolo.svg', 512, f'{BASE}/png/simbolo-512.png'),
]:
    d = png(nome, larg, saida)
    print(f'  {os.path.basename(saida):26s} {d[0]}x{d[1]}')

print('\nSVGs gerados:')
for n, desc in gerados:
    kb = os.path.getsize(f'{SVG}/{n}') // 1024
    print(f'  {n:36s} {kb:3d} KB  — {desc}')
