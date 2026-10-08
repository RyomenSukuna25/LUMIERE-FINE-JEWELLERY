import os, sys, math, random
sys.path.insert(0, os.path.dirname(__file__))
import jewel as J
root = os.path.join(os.path.dirname(__file__), '..')
ed = os.path.join(root, 'public/images/editorial'); cv = os.path.join(root, 'public/images/collections')
os.makedirs(ed, exist_ok=True); os.makedirs(cv, exist_ok=True)

def wrap(u, w, h, metal, bdefs, body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}"><defs>{J.defs(metal, u)}{bdefs}</defs>{body}</svg>'

def cover(name, mode, items, metal='yellow', w=1600, h=1000):
    u = name[:3] + 'cv'
    rnd = random.Random(sum(map(ord, name)))
    bd, bg = J.backdrop(u, mode, w, h, rnd)
    body = bg
    for (kind, design, stn, x, y, sc, pair, mt) in items:
        # items may override metal via separate defs id — keep single metal per cover for gradient ids
        p = J.piece(u, kind, design, stn)
        if pair: p = f'<g transform="translate(-70 0)">{p}</g><g transform="translate(70 0) scale(-1 1)">{p}</g>'
        body += f'<g transform="translate({x} {y}) scale({sc})" filter="url(#{"dsd" if mode=="dark" else "ds"}{u})">{p}</g>'
    vig = f'<radialGradient id="vg{u}" cx=".5" cy=".5" r=".8"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="{.4 if mode=="dark" else .14}"/></radialGradient>'
    body += f'<rect width="{w}" height="{h}" fill="url(#vg{u})"/>'
    open(os.path.join(cv, name + '.svg'), 'w').write(wrap(u, w, h, metal, bd + vig, body))

cover('rings', 'light', [('ring', 'solitaire', 'D', 1020, 500, 2.2, False, 0)])
cover('necklaces', 'dark', [('necklace', 'riviera', 'D', 800, 380, 3.1, False, 0)], 'white')
cover('earrings', 'blush', [('earring', 'drop', 'D', 800, 470, 2.8, True, 0)], 'white')
cover('bracelets', 'light', [('bracelet', 'tennis', 'D', 800, 520, 3.4, False, 0)], 'white')
cover('bridal', 'dark', [('set', 'bridal_set', 'R', 1000, 520, 1.5, False, 0)])
cover('diamond', 'dark', [('ring', 'halo', 'D', 1050, 520, 2.2, False, 0)], 'white')
cover('gold', 'blush', [('bracelet', 'stack', 'D', 1000, 520, 2.4, False, 0)], 'yellow')
cover('new-arrivals', 'light', [('ring', 'three', 'D', 1060, 520, 2.1, False, 0)], 'rose')

# ---------------- editorial scenes
def scene(name, u, w, h, metal, bdefs, body):
    open(os.path.join(ed, name + '.svg'), 'w').write(wrap(u, w, h, metal, bdefs, body))

def facets_big(u, cx, cy, r):
    o = ''
    for ring_i, (rr, n, op) in enumerate([(r, 16, .5), (r * .72, 16, .35), (r * .46, 8, .4)]):
        for k in range(n):
            a0 = math.radians(k * 360 / n + ring_i * 11); a1 = math.radians((k + 1) * 360 / n + ring_i * 11)
            am = (a0 + a1) / 2; ri = rr * .62
            pts = f'{cx+rr*math.cos(a0):.0f},{cy+rr*math.sin(a0):.0f} {cx+rr*math.cos(a1):.0f},{cy+rr*math.sin(a1):.0f} {cx+ri*math.cos(am):.0f},{cy+ri*math.sin(am):.0f}'
            o += f'<polygon points="{pts}" fill="{"#fff" if k%2==0 else "#6b7b8c"}" opacity="{op if k%2==0 else .22}"/>'
    o += f'<polygon points="' + ' '.join(f'{cx+r*.3*math.cos(math.radians(k*45-22.5)):.0f},{cy+r*.3*math.sin(math.radians(k*45-22.5)):.0f}' for k in range(8)) + '" fill="#fff" opacity=".6"/>'
    return o

def macro_brilliant():
    w, h, u = 2400, 1350, 'mbed'; rnd = random.Random(4)
    bd, bg = J.backdrop(u, 'dark', w, h, rnd)
    r = 470; cx, cy = 1560, 690
    body = bg + f'<g filter="url(#dsd{u})"><circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#sD{u})"/>' + facets_big(u, cx, cy, r) + f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3"/></g>'
    for i in range(14):
        a = rnd.uniform(0, 6.28); d = rnd.uniform(r * .9, r * 1.9)
        body += f'<line x1="{cx}" y1="{cy}" x2="{cx+d*math.cos(a):.0f}" y2="{cy+d*math.sin(a):.0f}" stroke="#F0D6A0" stroke-opacity=".07" stroke-width="{rnd.uniform(2,10):.0f}"/>'
    scene('macro-brilliant', u, w, h, 'yellow', bd, body)

def arch():
    w, h, u = 1600, 2000, 'arch'; rnd = random.Random(8)
    bd = ('<linearGradient id="wall%s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EFE7DA"/><stop offset="1" stop-color="#D9C7AC"/></linearGradient>'
          '<linearGradient id="light%s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF6E2"/><stop offset="1" stop-color="#F0D6A0"/></linearGradient>'
          '<linearGradient id="floor%s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9B28F"/><stop offset="1" stop-color="#8E7452"/></linearGradient>'
          '<linearGradient id="beam%s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF6E2" stop-opacity=".55"/><stop offset="1" stop-color="#FFF6E2" stop-opacity="0"/></linearGradient>') % (u, u, u, u)
    body = f'<rect width="{w}" height="{h}" fill="url(#wall{u})"/>'
    body += f'<path d="M420,1400 L420,720 A380,380 0 0 1 1180,720 L1180,1400Z" fill="url(#light{u})"/><path d="M470,1400 L470,730 A330,330 0 0 1 1130,730 L1130,1400Z" fill="#fff" opacity=".35"/>'
    body += f'<path d="M420,1400 L420,720 A380,380 0 0 1 1180,720 L1180,1400Z" fill="none" stroke="#B99A70" stroke-width="10" opacity=".7"/>'
    body += f'<rect y="1400" width="{w}" height="600" fill="url(#floor{u})"/><polygon points="420,1400 1180,1400 1500,2000 100,2000" fill="url(#beam{u})"/>'
    body += f'<rect width="{w}" height="{h}" filter="url(#nz{u})" opacity=".18"/>'
    # plinth with ring
    body += f'<ellipse cx="800" cy="1430" rx="230" ry="26" fill="#241F1B" opacity=".35" filter="url(#bl{u})"/><rect x="620" y="1160" width="360" height="270" rx="4" fill="#E6D8C0"/><rect x="620" y="1160" width="360" height="30" fill="#F7F1E8"/><rect x="620" y="1190" width="360" height="240" fill="#241F1B" opacity=".08"/>'
    body += f'<g transform="translate(800 1110) scale(.95)" filter="url(#ds{u})">{J.ring(u, "solitaire", "D")}</g>'
    scene('showroom-arch', u, w, h, 'yellow', bd, body)

def velvet_box():
    w, h, u = 2000, 1300, 'vbox'; rnd = random.Random(2)
    bd, bg = J.backdrop(u, 'dark', w, h, rnd)
    bd += f'<linearGradient id="vel{u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3b2a"/><stop offset="1" stop-color="#2b1b13"/></linearGradient><linearGradient id="lid{u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a20"/><stop offset="1" stop-color="#1b130f"/></linearGradient>'
    body = bg
    body += f'<g filter="url(#dsd{u})"><path d="M520,360 L1480,360 L1560,700 L440,700Z" fill="url(#lid{u})"/><path d="M440,700 L1560,700 L1500,1010 L500,1010Z" fill="url(#vel{u})"/><rect x="440" y="700" width="1120" height="14" fill="url(#gM{u})" opacity=".9"/></g>'
    body += f'<rect x="700" y="805" width="600" height="70" rx="30" fill="#140d09"/><rect x="700" y="805" width="600" height="14" rx="7" fill="#fff" opacity=".07"/>'
    body += f'<text x="1000" y="530" text-anchor="middle" font-family="Georgia, serif" font-size="64" letter-spacing="26" fill="#D4B895" opacity=".85">LUMIÈRE</text>'
    body += f'<g transform="translate(1000 690) scale(1.15)">{J.ring(u, "solitaire", "D")}</g>'
    scene('velvet-box', u, w, h, 'yellow', bd, body)

def silk():
    w, h, u = 1600, 2000, 'silk'; rnd = random.Random(5)
    bd = ''.join(f'<linearGradient id="s{i}{u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{a}"/><stop offset=".5" stop-color="{b}"/><stop offset="1" stop-color="{c}"/></linearGradient>' for i, (a, b, c) in enumerate([('#F7F1E8', '#E3D3BA', '#C8B08B'), ('#EFE7DA', '#D9C7AC', '#B99A70'), ('#E8D9C0', '#C9B28F', '#8E7452'), ('#D4B895', '#B99A70', '#6F5636')]))
    body = f'<rect width="{w}" height="{h}" fill="url(#s0{u})"/>'
    paths = ['M-100,300 C400,100 900,700 1700,420 L1700,900 C1100,1150 500,700 -100,980Z', 'M-100,780 C300,640 900,1180 1700,900 L1700,1400 C1000,1600 400,1160 -100,1380Z', 'M-100,1260 C400,1180 800,1700 1700,1380 L1700,2100 L-100,2100Z']
    for i, p in enumerate(paths):
        body += f'<path d="{p}" fill="url(#s{i+1}{u})" opacity=".92"/><path d="{p}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>'
    body += f'<g transform="translate(800 1050) scale(3.4)" filter="url(#ds{u})">{J.necklace(u, "heritage", "D")}</g><rect width="{w}" height="{h}" filter="url(#nz{u})" opacity=".14"/>'
    scene('silk-drape', u, w, h, 'yellow', bd, body)

def gold_flow():
    w, h, u = 2400, 1350, 'gflow'; rnd = random.Random(3)
    bd, bg = J.backdrop(u, 'dark', w, h, rnd)
    body = bg
    for i in range(16):
        y0 = 300 + i * 38
        d = f'M-100,{y0} C500,{y0-340+i*18} 1200,{y0+420-i*16} 2500,{y0-60}'
        body += f'<path d="{d}" fill="none" stroke="url(#gM{u})" stroke-width="{5 if i%3 else 9}" opacity="{.18+i*.045:.2f}"/>'
    scene('gold-flow', u, w, h, 'yellow', bd, body)

def gem_tray():
    w, h, u = 2000, 1300, 'tray'; rnd = random.Random(11)
    bd, bg = J.backdrop(u, 'dark', w, h, rnd)
    bd += f'<linearGradient id="vel{u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3326"/><stop offset="1" stop-color="#1d130e"/></linearGradient>'
    body = bg + f'<g filter="url(#dsd{u})"><rect x="260" y="230" width="1480" height="840" rx="26" fill="url(#vel{u})"/></g><rect x="290" y="260" width="1420" height="780" rx="14" fill="none" stroke="#D4B895" stroke-opacity=".3" stroke-width="2"/>'
    kinds = ['D', 'E', 'R', 'S', 'D', 'P', 'D', 'E', 'S', 'R', 'D', 'D']
    for i in range(12):
        x = 420 + (i % 4) * 380 + rnd.uniform(-30, 30); y = 400 + (i // 4) * 230 + rnd.uniform(-20, 20); r = rnd.uniform(46, 92)
        body += f'<g filter="url(#ds{u})">{J.stone(u, kinds[i], x, y, r, rnd.randint(0, 40))}</g>'
    body += f'<g transform="translate(1530 960) rotate(-24)" filter="url(#dsd{u})"><rect x="-8" y="-420" width="16" height="420" rx="6" fill="url(#gMv{u})"/><rect x="-8" y="-420" width="5" height="420" fill="#fff" opacity=".4"/></g>'
    scene('gem-tray', u, w, h, 'yellow', bd, body)

def plinths():
    w, h, u = 1600, 2000, 'plin'; rnd = random.Random(21)
    bd, bg = J.backdrop(u, 'light', w, h, rnd)
    bd += f'<linearGradient id="st{u}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F2E8D6"/><stop offset=".5" stop-color="#E0D0B6"/><stop offset="1" stop-color="#C5B08E"/></linearGradient>'
    body = bg
    for x, y, wd, hh, kind, des, stn, sc in [(180, 1180, 380, 620, 'earring', 'drop', 'D', 1.2), (620, 900, 380, 900, 'ring', 'halo', 'D', 1.35), (1060, 1320, 380, 480, 'bracelet', 'tennis', 'D', 1.0)]:
        body += f'<ellipse cx="{x+wd/2}" cy="{y+hh}" rx="{wd*.7}" ry="28" fill="#241F1B" opacity=".25" filter="url(#bl{u})"/><rect x="{x}" y="{y}" width="{wd}" height="{hh}" fill="url(#st{u})"/><rect x="{x}" y="{y}" width="{wd}" height="26" fill="#fff" opacity=".6"/>'
        p = J.piece(u, kind, des, stn)
        if kind == 'earring': p = f'<g transform="translate(-55 0)">{p}</g><g transform="translate(55 0) scale(-1 1)">{p}</g>'
        body += f'<g transform="translate({x+wd/2} {y-(190*sc if kind=="ring" else 70*sc) if kind!="bracelet" else y-60}) scale({sc})" filter="url(#ds{u})">{p}</g>'
    scene('plinths', u, w, h, 'white', bd, body)

def bridal_light():
    w, h, u = 1600, 2000, 'brid'; rnd = random.Random(31)
    bd, bg = J.backdrop(u, 'dark', w, h, rnd)
    body = bg + f'<g transform="translate(800 960) scale(3.0)" filter="url(#dsd{u})">{J.set_piece(u, "bridal_set", "R")}</g>'
    scene('bridal-light', u, w, h, 'yellow', bd, body)

def pearl_macro():
    w, h, u = 1600, 2000, 'pmac'; rnd = random.Random(41)
    bd, bg = J.backdrop(u, 'blush', w, h, rnd)
    body = bg
    for x, y, r in [(520, 1100, 330), (1060, 700, 270), (980, 1320, 210), (330, 560, 160)]:
        body += f'<g filter="url(#ds{u})">{J.stone(u, "P", x, y, r)}</g>'
    scene('pearl-macro', u, w, h, 'yellow', bd, body)

for f in [macro_brilliant, arch, velvet_box, silk, gold_flow, gem_tray, plinths, bridal_light, pearl_macro]: f()
print('editorial + covers done')
