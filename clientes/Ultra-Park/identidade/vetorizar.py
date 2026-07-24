"""
Vetorizacao fiel do logo Ultra Park.

O bitmap de origem tem 158x126 px — pouco para tracar o wordmark (23 px de altura).
Entao cada parte vem da melhor fonte possivel:

  elipse   -> primitiva <ellipse> ajustada aos pixels escuros
  U        -> tracado do bitmap, com separacao de cor sub-pixel (unmixing)
  wordmark -> Brush Script MT bold italic remontado em alta resolucao e tracado
  descritivo -> Arial Bold remontado em alta resolucao e tracado

Contornos por marching squares sobre o campo de cobertura continuo (nao sobre a
mascara binaria), o que da precisao sub-pixel. Depois RDP + cubicas Catmull-Rom
com deteccao de canto.
"""
import subprocess
import numpy as np
from PIL import Image

BASE = '/Users/danielromano/MazyOS/clientes/Ultra-Park/identidade'
TMP = '/private/tmp/claude-501/-Users-danielromano-MazyOS/39a13db4-2b42-4896-a171-8ab6cc922405/scratchpad'
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
LARANJA, TINTA = '#f07c00', '#1b1918'


# =============================================================== marching squares
def contornos(campo, nivel=0.5):
    g = np.pad(campo.astype(np.float64), 1, constant_values=0.0)
    a, b = g[:-1, :-1], g[:-1, 1:]
    c, d = g[1:, 1:], g[1:, :-1]
    idx = ((a > nivel).astype(np.uint8) << 3 | (b > nivel).astype(np.uint8) << 2 |
           (c > nivel).astype(np.uint8) << 1 | (d > nivel).astype(np.uint8))

    def t(v0, v1):
        den = v1 - v0
        return np.where(np.abs(den) < 1e-12, 0.5, (nivel - v0) / den)

    E = {
        't': lambda i, j: (j + t(a[i, j], b[i, j]), float(i)),
        'r': lambda i, j: (j + 1.0, i + t(b[i, j], c[i, j])),
        'b': lambda i, j: (j + t(d[i, j], c[i, j]), i + 1.0),
        'l': lambda i, j: (float(j), i + t(a[i, j], d[i, j])),
    }
    CASOS = {1: [('b', 'l')], 2: [('r', 'b')], 3: [('r', 'l')], 4: [('t', 'r')],
             5: [('t', 'l'), ('b', 'r')], 6: [('t', 'b')], 7: [('t', 'l')],
             8: [('l', 't')], 9: [('b', 't')], 10: [('l', 'b'), ('r', 't')],
             11: [('r', 't')], 12: [('l', 'r')], 13: [('b', 'r')], 14: [('l', 'b')]}

    segs = []
    for i, j in zip(*np.nonzero((idx > 0) & (idx < 15))):
        i, j = int(i), int(j)
        for e0, e1 in CASOS[int(idx[i, j])]:
            segs.append((E[e0](i, j), E[e1](i, j)))

    K = lambda p: (round(p[0], 4), round(p[1], 4))
    saindo = {}
    for p, q in segs:
        saindo.setdefault(K(p), []).append((K(p), K(q)))

    usados, polis = set(), []
    for seg in segs:
        atual = (K(seg[0]), K(seg[1]))
        if atual in usados:
            continue
        pts = [atual[0]]
        while atual and atual not in usados:
            usados.add(atual)
            pts.append(atual[1])
            atual = next((x for x in saindo.get(atual[1], []) if x not in usados), None)
        if len(pts) >= 4:
            polis.append(np.array(pts))
    return polis


def rdp(p, eps):
    if len(p) < 3:
        return p
    v = p[-1] - p[0]
    n = np.hypot(*v)
    dif = p - p[0]
    d = np.hypot(*dif.T) if n < 1e-9 else np.abs(v[0] * dif[:, 1] - v[1] * dif[:, 0]) / n
    k = int(np.argmax(d))
    if d[k] > eps:
        return np.vstack([rdp(p[:k + 1], eps)[:-1], rdp(p[k:], eps)])
    return np.array([p[0], p[-1]])


def area(p):
    x, y = p[:, 0], p[:, 1]
    return 0.5 * abs(np.dot(x, np.roll(y, -1)) - np.dot(y, np.roll(x, -1)))


def path(p, k, dx, dy, ang_canto):
    q = p[:-1] if np.allclose(p[0], p[-1]) else p
    n = len(q)
    if n < 3:
        return ''
    ant, prox = np.roll(q, 1, axis=0), np.roll(q, -1, axis=0)
    v1, v2 = q - ant, prox - q
    ang = np.arctan2(v1[:, 0] * v2[:, 1] - v1[:, 1] * v2[:, 0], np.sum(v1 * v2, axis=1))
    tg = (prox - ant) / 6.0
    tg[np.abs(ang) > ang_canto] = 0.0

    f = lambda z: (round(z[0] * k + dx, 2), round(z[1] * k + dy, 2))
    out = ['M %g %g' % f(q[0])]
    for i in range(n):
        j = (i + 1) % n
        out.append('C %g %g %g %g %g %g' % (f(q[i] + tg[i]) + f(q[j] - tg[j]) + f(q[j])))
    return ' '.join(out) + ' Z'


def tracar(campo, k=1.0, dx=0.0, dy=0.0, eps=0.6, area_min=2.0, canto=55):
    ang = np.deg2rad(canto)
    saida = []
    for poli in contornos(campo):
        s = rdp(poli, eps)
        if area(s) * k * k < area_min:
            continue
        d = path(s, k, dx, dy, ang)
        if d:
            saida.append(d)
    return saida


# =============================================================== tipo em alta resolucao
def render_texto(nome, html_corpo, w, h):
    """Renderiza texto preto sobre transparente e devolve o campo de cobertura."""
    html = f'''<!doctype html><meta charset="utf-8"><style>
      html,body{{margin:0;padding:0;background:transparent}}
      div{{position:absolute;top:40px;left:40px;color:#000;white-space:nowrap;line-height:1}}
    </style>{html_corpo}'''
    open(f'{TMP}/{nome}.html', 'w').write(html)
    subprocess.run([CHROME, '--headless', '--disable-gpu', '--hide-scrollbars',
                    '--default-background-color=00000000',
                    f'--window-size={w},{h}', f'--screenshot={TMP}/{nome}.png',
                    f'file://{TMP}/{nome}.html'],
                   capture_output=True)
    im = Image.open(f'{TMP}/{nome}.png').convert('RGBA')
    a = np.asarray(im)[:, :, 3].astype(np.float64) / 255.0
    ys, xs = np.nonzero(a > 0.02)
    caixa = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    return a[caixa[1]:caixa[3], caixa[0]:caixa[2]], caixa


# =============================================================== origem
im = Image.open(f'{BASE}/logo-oficial-recortado.png').convert('RGBA')
W, H = im.size
px = np.asarray(im).astype(np.float64)
al = px[:, :, 3:4] / 255.0
comp = px[:, :, :3] * al + 255.0 * (1 - al)          # composto sobre branco

# separacao de cor: cada pixel como mistura de laranja / tinta / fundo
M = np.array([[240, 27, 255], [124, 25, 255], [0, 24, 255]], dtype=np.float64)
A = np.vstack([M, np.full((1, 3), 255.0)])            # 4a linha forca soma = 1
alvo = np.concatenate([comp.reshape(-1, 3), np.full((comp[:, :, 0].size, 1), 255.0)], axis=1)
w = np.linalg.lstsq(A, alvo.T, rcond=None)[0].T
w = np.clip(w, 0, 1).reshape(H, W, 3)
campo_laranja = w[:, :, 0]

# elipse ajustada aos pixels escuros da marca
escuro = (px[:, :, 3] > 128) & (w[:, :, 1] > 0.5)
escuro[84:] = False
ys, xs = np.nonzero(escuro)
cx, cy = (xs.min() + xs.max() + 1) / 2, (ys.min() + ys.max() + 1) / 2
rx, ry = (xs.max() + 1 - xs.min()) / 2, (ys.max() + 1 - ys.min()) / 2

# U: campo de cobertura ampliado (bicubica gera a suavizacao sub-pixel)
S = 8
cu = campo_laranja.copy()
cu[84:] = 0
imf = Image.fromarray((np.clip(cu, 0, 1) * 255).astype(np.uint8))
campo_u = np.asarray(imf.resize((W * S, H * S), Image.BICUBIC), dtype=np.float64) / 255.0
paths_u = tracar(campo_u, k=1.0 / S, eps=1.6, area_min=3.0, canto=62)

# medidas do wordmark e do descritivo no original
cobertura = 1.0 - comp.mean(axis=2) / 255.0     # cobertura de tinta preta, 0..1
def caixa_de(l0, l1):
    ys, xs = np.nonzero(cobertura[l0:l1] > 0.5)   # nivel 0.5 = borda real
    return xs.min(), l0 + ys.min(), xs.max() + 1.0, l0 + ys.max() + 1.0
cx0, cy0, cx1, cy1 = caixa_de(85, 112)
ex0, ey0, ex1, ey1 = caixa_de(112, H)
print(f'wordmark no original: x {cx0}-{cx1} ({cx1-cx0}px)  y {cy0}-{cy1} ({cy1-cy0}px)')
print(f'descritivo no original: x {ex0}-{ex1} ({ex1-ex0}px)  y {ey0}-{ey1} ({ey1-ey0}px)')

# remonta o tipo em alta resolucao
campo_wm, _ = render_texto(
    'r-wm', '<div style="font-family:\'Brush Script MT\';font-weight:normal;'
            'font-style:italic;font-size:520px">Ultra Park</div>', 2600, 900)
campo_est, _ = render_texto(
    'r-est', '<div style="font-family:Helvetica;font-weight:bold;font-size:210px;'
             'letter-spacing:0.03em">ESTACIONAMENTOS</div>', 2800, 500)

def encaixar(campo, x0, y0, x1, y1, eps, canto):
    """Traca o campo e encaixa na caixa do original (x e y independentes)."""
    h, w_ = campo.shape
    kx, ky = (x1 - x0) / w_, (y1 - y0) / h
    print(f'  encaixe: {w_}x{h} -> {x1-x0:.0f}x{y1-y0:.0f}  (estiramento {kx/ky:.3f}x)')
    saida = []
    for poli in contornos(campo):
        sp = rdp(poli, eps)
        if area(sp) * kx * ky < 0.5:
            continue
        q = sp[:-1] if np.allclose(sp[0], sp[-1]) else sp
        if len(q) < 3:
            continue
        ant, prox = np.roll(q, 1, axis=0), np.roll(q, -1, axis=0)
        v1, v2 = q - ant, prox - q
        ang = np.arctan2(v1[:, 0] * v2[:, 1] - v1[:, 1] * v2[:, 0], np.sum(v1 * v2, axis=1))
        tg = (prox - ant) / 6.0
        tg[np.abs(ang) > np.deg2rad(canto)] = 0.0
        f = lambda z: (round(z[0] * kx + x0, 2), round(z[1] * ky + y0, 2))
        d = ['M %g %g' % f(q[0])]
        for i in range(len(q)):
            j = (i + 1) % len(q)
            d.append('C %g %g %g %g %g %g' % (f(q[i] + tg[i]) + f(q[j] - tg[j]) + f(q[j])))
        saida.append(' '.join(d) + ' Z')
    return saida, ky * h

paths_wm, alt_wm = encaixar(campo_wm, cx0, cy0, cx1, cy1, eps=1.1, canto=58)
paths_est, alt_est = encaixar(campo_est, ex0, ey0, ex1, ey1, eps=0.9, canto=50)
print(f'contornos: U={len(paths_u)}  wordmark={len(paths_wm)}  descritivo={len(paths_est)}')

svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
       f'width="{W*10}" height="{H*10}" fill-rule="evenodd">',
       '  <title>Ultra Park Estacionamentos</title>',
       f'  <ellipse cx="{cx:.2f}" cy="{cy:.2f}" rx="{rx:.2f}" ry="{ry:.2f}" fill="{TINTA}"/>']
# todos os contornos de um mesmo grupo num unico path: e' o que faz o evenodd
# furar os contadores das letras em vez de preenche-los
svg.append(f'  <path fill="{LARANJA}" d="{" ".join(paths_u)}"/>')
svg.append(f'  <path fill="{TINTA}" d="{" ".join(paths_wm)}"/>')
svg.append(f'  <path fill="{TINTA}" d="{" ".join(paths_est)}"/>')
svg.append('</svg>')

destino = f'{BASE}/svg/ultra-park-logo.svg'
open(destino, 'w').write('\n'.join(svg))
print('gerado:', destino, len('\n'.join(svg)) // 1024, 'KB')
