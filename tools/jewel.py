"""LUMIERE jewellery vector renderer.
Parametric studio-style renders of jewellery pieces as standalone SVG files.
Every piece is drawn in a local coordinate space and placed on a backdrop.
"""
import math, random

METALS = {
  'yellow': ['#FFF3CC', '#EBCB86', '#BC8F48', '#F0D794', '#8F6A33'],
  'rose':   ['#FFE6D8', '#E8B79D', '#B97F63', '#EEC3AC', '#87533E'],
  'white':  ['#FFFFFF', '#DCDDDE', '#9C9DA2', '#EEF0F0', '#6F7176'],
}

def defs(metal, uid):
    m = METALS[metal]
    stops = ''.join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in zip([0, .26, .52, .74, 1], m))
    g = f'<linearGradient id="gM{uid}" gradientUnits="userSpaceOnUse" x1="-220" y1="-220" x2="220" y2="220">{stops}</linearGradient>'
    g += f'<linearGradient id="gMv{uid}" gradientUnits="userSpaceOnUse" x1="0" y1="-200" x2="0" y2="200">{stops}</linearGradient>'
    def rg(i, cols, fx=.35, fy=.3):
        s = ''.join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in cols)
        return f'<radialGradient id="{i}{uid}" cx=".5" cy=".5" r=".62" fx="{fx}" fy="{fy}">{s}</radialGradient>'
    g += rg('sD', [(0, '#FFFFFF'), (.45, '#E4ECF3'), (1, '#A9BACB')])
    g += rg('sE', [(0, '#7BE3B0'), (.5, '#1E9468'), (1, '#0A4B37')])
    g += rg('sR', [(0, '#FF93A4'), (.5, '#C71F3E'), (1, '#6A0E20')])
    g += rg('sS', [(0, '#9DBDFF'), (.5, '#2A4FC0'), (1, '#0E1D5C')])
    g += rg('sP', [(0, '#FFFFFF'), (.55, '#F4EDE3'), (1, '#CDBFAE')], .32, .28)
    g += rg('sB', [(0, '#5B5550'), (.5, '#1E1B19'), (1, '#050403')], .32, .28)
    g += rg('sK', [(0, '#FFE9B8'), (.5, '#C99A4C'), (1, '#6D4A1E')], .32, .28)
    g += '<filter id="ds%s" x="-30%%" y="-30%%" width="160%%" height="170%%"><feDropShadow dx="0" dy="14" stdDeviation="13" flood-color="#241F1B" flood-opacity=".30"/></filter>' % uid
    g += '<filter id="dsd%s" x="-30%%" y="-30%%" width="160%%" height="170%%"><feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#000" flood-opacity=".65"/></filter>' % uid
    g += '<filter id="bl%s" x="-50%%" y="-50%%" width="200%%" height="200%%"><feGaussianBlur stdDeviation="14"/></filter>' % uid
    g += '<filter id="bl2%s" x="-50%%" y="-50%%" width="200%%" height="200%%"><feGaussianBlur stdDeviation="34"/></filter>' % uid
    g += '<filter id="nz%s" x="0" y="0" width="100%%" height="100%%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 .2  0 0 0 0 .16  0 0 0 0 .12  1.4 0 0 0 -.45"/></filter>' % uid
    return g

def stone(u, kind, cx, cy, r, rot=0, sx=1, sy=1):
    """Faceted round brilliant as seen from above (kind: D,E,R,S,P,B,K)"""
    if kind in ('P', 'B', 'K'):
        hl = f'<ellipse cx="{-r*.34:.1f}" cy="{-r*.36:.1f}" rx="{r*.3:.1f}" ry="{r*.2:.1f}" fill="#fff" opacity="{.85 if kind=="P" else .45}" transform="rotate(-30 {-r*.34:.1f} {-r*.36:.1f})"/>'
        return (f'<g transform="translate({cx:.1f} {cy:.1f}) scale({sx} {sy})"><circle r="{r:.1f}" fill="url(#s{kind}{u})"/>'
                f'<circle r="{r:.1f}" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="{max(.6, r*.04):.1f}"/>{hl}</g>')
    o = ''
    n = 8
    for k in range(n):
        a0 = math.radians(k * 360 / n - 22.5); a1 = math.radians((k + 1) * 360 / n - 22.5); am = (a0 + a1) / 2
        p = f'{r*math.cos(a0):.1f},{r*math.sin(a0):.1f} {r*math.cos(a1):.1f},{r*math.sin(a1):.1f} {r*.56*math.cos(am):.1f},{r*.56*math.sin(am):.1f}'
        o += f'<polygon points="{p}" fill="{"#fff" if k%2==0 else "#000"}" opacity="{.5 if k%2==0 else .16}"/>'
        q = f'{r*.56*math.cos(a0 + 0.39):.1f},{r*.56*math.sin(a0 + 0.39):.1f} {r*.56*math.cos(a1 + .39):.1f},{r*.56*math.sin(a1 + .39):.1f} {r*.3*math.cos(am + .39):.1f},{r*.3*math.sin(am + .39):.1f}'
        o += f'<polygon points="{q}" fill="{"#fff" if k%2 else "#000"}" opacity="{.3 if k%2 else .1}"/>'
    tbl = ' '.join(f'{r*.34*math.cos(math.radians(k*45-22.5)):.1f},{r*.34*math.sin(math.radians(k*45-22.5)):.1f}' for k in range(8))
    o += f'<polygon points="{tbl}" fill="#fff" opacity=".42" stroke="#fff" stroke-opacity=".7" stroke-width="{max(.5, r*.02):.1f}"/>'
    o += f'<ellipse cx="{-r*.3:.1f}" cy="{-r*.34:.1f}" rx="{r*.2:.1f}" ry="{r*.12:.1f}" fill="#fff" opacity=".9" transform="rotate(-35 {-r*.3:.1f} {-r*.34:.1f})"/>'
    return (f'<g transform="translate({cx:.1f} {cy:.1f}) rotate({rot}) scale({sx} {sy})"><circle r="{r:.1f}" fill="url(#s{kind}{u})"/>{o}'
            f'<circle r="{r:.1f}" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="{max(.6, r*.045):.1f}"/></g>')

def pear_path(w, h):
    cy = h / 2 - w / 2
    return (f'M0,{-h/2:.1f} C{w*.12:.1f},{-h*.28:.1f} {w/2:.1f},{cy-h*.28:.1f} {w/2:.1f},{cy:.1f} '
            f'A{w/2:.1f} {w/2:.1f} 0 0 1 {-w/2:.1f},{cy:.1f} C{-w/2:.1f},{cy-h*.28:.1f} {-w*.12:.1f},{-h*.28:.1f} 0,{-h/2:.1f}Z'), cy

def pear(u, kind, cx, cy, w, h, frame=True, halo=0):
    d, c = pear_path(w, h)
    o = f'<g transform="translate({cx:.1f} {cy:.1f})">'
    if frame:
        fd, _ = pear_path(w + 14, h + 16)
        o += f'<path d="{fd}" fill="url(#gM{u})" stroke="#000" stroke-opacity=".18" stroke-width="1.2"/>'
        if halo:
            for k in range(halo):
                t = k / halo * 2 * math.pi
                o += f'<circle cx="{(w/2+3.5)*math.cos(t):.1f}" cy="{c+(w/2+3.5)*math.sin(t):.1f}" r="2.8" fill="url(#sD{u})"/>'
    o += f'<path d="{d}" fill="url(#s{kind}{u})" stroke="#000" stroke-opacity=".3" stroke-width="1.1"/>'
    pts = [(0, -h / 2), (w * .36, c - h * .2)] + [(w / 2 * math.cos(math.radians(t)), c + w / 2 * math.sin(math.radians(t))) for t in range(0, 181, 30)] + [(-w * .36, c - h * .2)]
    for i in range(len(pts)):
        a, b = pts[i], pts[(i + 1) % len(pts)]
        o += f'<polygon points="{a[0]:.1f},{a[1]:.1f} {b[0]:.1f},{b[1]:.1f} 0,{c:.1f}" fill="{"#fff" if i%2==0 else "#000"}" opacity="{.42 if i%2==0 else .15}"/>'
    o += f'<ellipse cx="{-w*.16:.1f}" cy="{c-h*.1:.1f}" rx="{w*.12:.1f}" ry="{h*.06:.1f}" fill="#fff" opacity=".85" transform="rotate(-25 {-w*.16:.1f} {c-h*.1:.1f})"/>'
    return o + '</g>'

def gold_ellipse(u, cx, cy, rx, ry, sw, hl=True, rot=0, grad='gM'):
    o = f'<g transform="rotate({rot} {cx} {cy})">'
    o += f'<ellipse cx="{cx}" cy="{cy+3}" rx="{rx}" ry="{ry}" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="{sw+2}"/>'
    o += f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="none" stroke="url(#{grad}{u})" stroke-width="{sw}"/>'
    if hl:
        o += f'<ellipse cx="{cx}" cy="{cy}" rx="{rx-sw*.28}" ry="{ry-sw*.28}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="{max(1.5, sw*.1):.1f}" stroke-dasharray="{rx*1.4:.0f} {rx*9:.0f}" stroke-dashoffset="{rx*1.9:.0f}" stroke-linecap="round"/>'
        o += f'<ellipse cx="{cx}" cy="{cy}" rx="{rx+sw*.4}" ry="{ry+sw*.4}" fill="none" stroke="#000" stroke-opacity=".14" stroke-width="{max(1.2, sw*.08):.1f}"/>'
    return o + '</g>'

def claws(u, cx, cy, r, n=4):
    o = ''
    for k in range(n):
        a = math.radians(k * 360 / n + 45)
        x, y = cx + r * math.cos(a), cy + r * .86 * math.sin(a)
        o += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{max(3,r*.1):.1f}" fill="url(#gM{u})" stroke="#000" stroke-opacity=".25" stroke-width=".8"/>'
    return o

def along_ellipse(cx, cy, rx, ry, n, a0=0, a1=360):
    return [(cx + rx * math.cos(math.radians(a0 + (a1 - a0) * i / n)), cy + ry * math.sin(math.radians(a0 + (a1 - a0) * i / n)), a0 + (a1 - a0) * i / n) for i in range(n)]

# ---------------------------------------------------------------- RINGS
def ring(u, kind, stn):
    cx, cy, rx, ry = 0, 52, 118, 128
    sw = 34 if kind == 'plain' else 24
    o = gold_ellipse(u, cx, cy, rx, ry, sw)
    # inner bore shading
    o += f'<ellipse cx="0" cy="{cy}" rx="{rx-sw/2-1}" ry="{ry-sw/2-1}" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="3"/>'
    s = stn
    if kind in ('pave', 'eternity', 'plain') or kind == 'pavesol':
        pass
    if kind in ('pave', 'pavesol', 'eternity'):
        n = 30 if kind == 'eternity' else 22
        a0, a1 = (0, 360) if kind == 'eternity' else (20, 160)
        pts = along_ellipse(cx, cy, rx, ry, n, a0, a1) if kind == 'eternity' else along_ellipse(cx, cy, rx, ry, 14, 18, 162) + along_ellipse(cx, cy, rx, ry, 14, 198, 342)
        for x, y, a in pts:
            if kind != 'eternity' and abs(y - (cy - ry)) < 30: continue
            o += stone(u, 'D', x, y, 6.6 if kind != 'eternity' else 7.4)
    head = ''
    if kind in ('solitaire', 'pavesol'):
        r = 44 if kind == 'solitaire' else 36
        head += f'<path d="M-28,-88 L28,-88 L16,{-70+ (0)} L-16,-70Z" fill="url(#gMv{u})" stroke="#000" stroke-opacity=".25"/>'
        head += claws(u, 0, -120, r + 2) + stone(u, s, 0, -120, r)
    elif kind == 'halo':
        head += f'<circle cx="0" cy="-118" r="68" fill="url(#gM{u})" stroke="#000" stroke-opacity=".25" stroke-width="1.2"/>'
        head += stone(u, s, 0, -118, 38)
        for x, y, a in along_ellipse(0, -118, 54, 54, 14):
            head += stone(u, 'D', x, y, 9.5)
    elif kind == 'three':
        head += f'<path d="M-96,-88 Q0,-72 96,-88 L84,-68 Q0,-52 -84,-68Z" fill="url(#gMv{u})" stroke="#000" stroke-opacity=".25"/>'
        head += stone(u, 'D', -66, -98, 24, 0) + stone(u, 'D', 66, -98, 24, 0) + claws(u, 0, -112, 40) + stone(u, s, 0, -112, 36)
    elif kind == 'cocktail':
        head += f'<ellipse cx="0" cy="-120" rx="74" ry="86" fill="url(#gM{u})" stroke="#000" stroke-opacity=".25" stroke-width="1.2"/>'
        head += stone(u, s, 0, -120, 46, 0, 1, 1.22)
        for x, y, a in along_ellipse(0, -120, 61, 74, 18):
            head += stone(u, 'D', x, y, 7)
    return o + head

# ---------------------------------------------------------------- EARRINGS
def earring(u, kind, stn):
    s = stn; o = ''
    if kind == 'stud':
        o += f'<circle r="52" fill="url(#gM{u})" stroke="#000" stroke-opacity=".25" stroke-width="1.2"/>' + claws(u, 0, 0, 44) + stone(u, s, 0, 0, 40)
    elif kind == 'cluster':
        for x, y, a in along_ellipse(0, 0, 44, 44, 8):
            o += stone(u, 'D', x, y, 20)
        o += stone(u, s, 0, 0, 34)
    elif kind == 'pavestud':
        o += f'<circle r="68" fill="url(#gM{u})" stroke="#000" stroke-opacity=".25"/>'
        for x, y, a in along_ellipse(0, 0, 55, 55, 16): o += stone(u, 'D', x, y, 9)
        o += stone(u, s, 0, 0, 36)
    elif kind == 'drop':
        o += f'<rect x="-3.5" y="-96" width="7" height="30" fill="url(#gMv{u})"/>'
        o += stone(u, 'D', 0, -118, 24) + claws(u, 0, -118, 26)
        o += pear(u, s, 0, -24, 56, 104, True, 12)
        o += f'<circle cx="0" cy="-74" r="8" fill="url(#gM{u})" stroke="#000" stroke-opacity=".25"/>'
    elif kind == 'pearl':
        o += stone(u, 'D', 0, -118, 22) + claws(u, 0, -118, 24)
        o += f'<rect x="-3" y="-98" width="6" height="26" fill="url(#gMv{u})"/><path d="M-20,-76 Q0,-60 20,-76 L12,-56 L-12,-56Z" fill="url(#gMv{u})" stroke="#000" stroke-opacity=".25"/>'
        o += stone(u, 'P', 0, -4, 54)
    elif kind == 'chandelier':
        o += f'<circle cx="0" cy="-128" r="30" fill="url(#gM{u})" stroke="#000" stroke-opacity=".25"/>' + stone(u, s, 0, -128, 19)
        o += f'<rect x="-3" y="-100" width="6" height="22" fill="url(#gMv{u})"/>'
        for tier, (cy0, rad, n, L) in enumerate([(-72, 56, 5, 40), (-6, 88, 7, 62)]):
            ang = [200 + (140 * i / (n - 1)) for i in range(n)]
            o += f'<path d="M{rad*math.cos(math.radians(ang[0])):.1f},{cy0 - rad*math.sin(math.radians(ang[0]))*-1:.1f} ' + ' '.join('' for _ in [0]) + '" />'
            pts = [(rad * math.cos(math.radians(a)), cy0 - rad * math.sin(math.radians(a)) * .0 + rad * .45 * math.sin(math.radians(a))) for a in ang]
            d = 'M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts)
            o += f'<path d="{d}" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="9" stroke-linecap="round" transform="translate(0 2)"/><path d="{d}" fill="none" stroke="url(#gM{u})" stroke-width="7" stroke-linecap="round"/>'
            for i, (x, y) in enumerate(pts):
                ll = L * (1 + .45 * (1 - abs(i - (n - 1) / 2) / ((n - 1) / 2)))
                o += f'<line x1="{x:.1f}" y1="{y:.1f}" x2="{x:.1f}" y2="{y+10:.1f}" stroke="url(#gMv{u})" stroke-width="2.4"/>'
                o += pear(u, s if i % 2 == 0 else 'D', x, y + 12 + ll / 2, 22 + tier * 4, ll, True)
                o += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="5" fill="url(#gM{u})"/>'
    elif kind == 'hoop':
        o += gold_ellipse(u, 0, 0, 72, 88, 18)
        for x, y, a in along_ellipse(0, 0, 72, 88, 26, 0, 360): o += stone(u, 'D', x, y, 6.6)
        o += stone(u, 'D', 0, -88, 12)
    elif kind == 'jhumka':
        o += stone(u, s, 0, -118, 24) + f'<circle cx="0" cy="-118" r="31" fill="none" stroke="url(#gM{u})" stroke-width="6"/>'
        o += f'<rect x="-3" y="-90" width="6" height="22" fill="url(#gMv{u})"/>'
        o += f'<path d="M-62,6 C-62,-84 62,-84 62,6 Z" fill="url(#gM{u})" stroke="#000" stroke-opacity=".28" stroke-width="1.4"/>'
        for r_ in range(4):
            for c_ in range(-3 + (r_ % 2), 4, 2):
                px, py = c_ * 15, -52 + r_ * 17
                if abs(px) < 52 - r_ * 2 + 6: o += stone(u, 'D', px, py, 5.2)
        o += f'<path d="M-62,6 Q0,24 62,6" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="2"/>'
        for x, y, a in along_ellipse(0, 12, 56, 12, 9, 0, 180):
            o += f'<line x1="{x:.1f}" y1="{y:.1f}" x2="{x:.1f}" y2="{y+14:.1f}" stroke="url(#gMv{u})" stroke-width="1.6"/>' + stone(u, 'P', x, y + 24, 9)
    return o

# ---------------------------------------------------------------- NECKLACES
def qpt(p0, c, p1, t):
    return ((1-t)**2*p0[0] + 2*(1-t)*t*c[0] + t**2*p1[0], (1-t)**2*p0[1] + 2*(1-t)*t*c[1] + t**2*p1[1])

def chain(u, p0, c, p1, w=4.2):
    d = f'M{p0[0]},{p0[1]} Q{c[0]},{c[1]} {p1[0]},{p1[1]}'
    return (f'<path d="{d}" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="{w+2}" transform="translate(0 2.5)"/>'
            f'<path d="{d}" fill="none" stroke="url(#gM{u})" stroke-width="{w}"/>'
            f'<path d="{d}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="{w*.35:.1f}" stroke-dasharray="1.6 5.4" stroke-linecap="round"/>')

def beads(u, kind, p0, c, p1, n, r0, r1, bezel=False, pw=1.5):
    o = ''
    for i in range(n):
        t = (i + .5) / n
        x, y = qpt(p0, c, p1, t)
        k = 1 - abs(2 * t - 1) ** pw
        r = r0 + (r1 - r0) * k
        if bezel: o += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r+3.5:.1f}" fill="url(#gM{u})" stroke="#000" stroke-opacity=".25" stroke-width=".8"/>'
        o += stone(u, kind, x, y, r)
    return o

def lotus(u, cx, cy, r):
    o = ''
    for k in range(8):
        a = k * 45
        o += f'<path d="M0,0 C{r*.18:.1f},{-r*.25:.1f} {r*.2:.1f},{-r*.62:.1f} 0,{-r*.8:.1f} C{-r*.2:.1f},{-r*.62:.1f} {-r*.18:.1f},{-r*.25:.1f} 0,0Z" fill="url(#gMv{u})" stroke="#000" stroke-opacity=".35" stroke-width="1.1" transform="translate({cx} {cy}) rotate({a})"/>'
    return o

def medallion(u, cx, cy, r, stn='D'):
    o = f'<circle cx="{cx}" cy="{cy+3}" r="{r+2}" fill="#000" opacity=".25"/><circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#gM{u})" stroke="#000" stroke-opacity=".3" stroke-width="1.4"/>'
    o += f'<circle cx="{cx}" cy="{cy}" r="{r*.8}" fill="#000" opacity=".16"/><circle cx="{cx}" cy="{cy}" r="{r*.78}" fill="url(#gMv{u})" opacity=".92"/>'
    for x, y, a in along_ellipse(cx, cy, r * .9, r * .9, 28): o += stone(u, 'D', x, y, 2.6)
    o += lotus(u, cx, cy, r * .62) + stone(u, stn, cx, cy, r * .13)
    return o

def necklace(u, kind, stn):
    P0, P1 = (-170, -112), (170, -112)
    o = ''
    if kind == 'heritage':
        C = (0, 236); o += chain(u, P0, C, P1)
        mx, my = qpt(P0, C, P1, .5)
        o += f'<rect x="-3" y="{my-4:.1f}" width="6" height="22" fill="url(#gMv{u})"/>' + medallion(u, 0, my + 72, 62, stn)
    elif kind == 'riviera':
        C = (0, 250)
        o += chain(u, P0, C, P1, 5); o += beads(u, 'D', P0, C, P1, 25, 8.5, 20, True)
    elif kind == 'layered':
        C1, C2 = (0, 190), (0, 262)
        o += chain(u, P0, C2, P1, 3.4) + chain(u, (-150, -112), C1, (150, -112), 3.4)
        x, y = qpt(P0, C2, P1, .5); o += f'<line x1="0" y1="{y:.1f}" x2="0" y2="{y+14:.1f}" stroke="url(#gMv{u})" stroke-width="3"/>' + stone(u, stn, 0, y + 40, 22) + claws(u, 0, y + 40, 24)
        x, y = qpt((-150, -112), C1, (150, -112), .5); o += medallion(u, 0, y + 34, 24, stn)
    elif kind == 'bridal':
        C1, C2 = (0, 150), (0, 232)
        o += chain(u, P0, C2, P1, 3) + beads(u, 'D', (-165, -105), C1, (165, -105), 22, 6, 12, True) + beads(u, 'D', (-150, -88), (0, 218), (150, -88), 17, 7, 13, True)
        for i in range(-3, 4):
            t = .5 + i * .085
            x, y = qpt((-150, -88), (0, 218), (150, -88), t)
            L = 74 - abs(i) * 10
            o += f'<line x1="{x:.1f}" y1="{y:.1f}" x2="{x:.1f}" y2="{y+12:.1f}" stroke="url(#gMv{u})" stroke-width="2.4"/>' + pear(u, stn if i % 2 == 0 else 'D', x, y + 14 + L / 2, 26, L, True)
    elif kind == 'pearl':
        o += beads(u, 'P', (-170, -112), (0, 250), (170, -112), 31, 11, 17) + beads(u, 'P', (-155, -112), (0, 200), (155, -112), 27, 9.5, 15)
        o += f'<circle cx="-170" cy="-112" r="9" fill="url(#gM{u})"/><circle cx="170" cy="-112" r="9" fill="url(#gM{u})"/>'
    elif kind == 'mangal':
        C = (0, 250)
        for i in range(36):
            t = (i + .5) / 36; x, y = qpt(P0, C, P1, t)
            o += stone(u, 'K' if i % 4 == 3 else 'B', x, y, 8.4 if i % 4 == 3 else 7)
        o += chain(u, (-166, -112), (0, 240), (166, -112), 2.2)
        mx, my = qpt(P0, C, P1, .5)
        o += f'<path d="M-30,{my:.1f} Q0,{my+54:.1f} 30,{my:.1f} L18,{my+8:.1f} Q0,{my+40:.1f} -18,{my+8:.1f}Z" fill="url(#gM{u})" stroke="#000" stroke-opacity=".3"/>'
        o += medallion(u, 0, my + 62, 30, stn)
    elif kind == 'stations':
        C = (0, 230); o += chain(u, P0, C, P1, 3.6)
        for t, L in [(.2, 36), (.32, 52), (.44, 70), (.5, 88), (.56, 70), (.68, 52), (.8, 36)]:
            x, y = qpt(P0, C, P1, t)
            o += f'<line x1="{x:.1f}" y1="{y:.1f}" x2="{x:.1f}" y2="{y+10:.1f}" stroke="url(#gMv{u})" stroke-width="2.2"/>' + pear(u, stn if t == .5 else 'D', x, y + 12 + L / 2, 24 if t == .5 else 18, L, True)
    elif kind == 'maharani':
        C = (0, 225)
        o += chain(u, P0, C, P1, 5) + beads(u, 'D', P0, C, P1, 23, 7.5, 15, True)
        mx, my = qpt(P0, C, P1, .5)
        for dx, L, w in [(-66, 88, 40), (0, 126, 56), (66, 88, 40)]:
            x, y = qpt(P0, C, P1, .5 + dx / 340)
            o += f'<line x1="{x:.1f}" y1="{y+10:.1f}" x2="{x:.1f}" y2="{y+26:.1f}" stroke="url(#gMv{u})" stroke-width="3"/>' + pear(u, stn, x, y + 28 + L / 2, w, L, True, 12)
    elif kind == 'pendant_solitaire':
        C = (0, 170); P0, P1 = (-170, -170), (170, -170); o += chain(u, P0, C, P1, 4)
        mx, my = qpt(P0, C, P1, .5); o += f'<line x1="0" y1="{my:.1f}" x2="0" y2="{my+16:.1f}" stroke="url(#gMv{u})" stroke-width="3.4"/>' + f'<circle cx="0" cy="{my+68:.1f}" r="58" fill="url(#gM{u})" stroke="#000" stroke-opacity=".28" stroke-width="1.4"/>' + stone(u, stn, 0, my + 68, 42) + claws(u, 0, my + 68, 44)
    elif kind == 'pendant_pear':
        C = (0, 170); P0, P1 = (-170, -170), (170, -170); o += chain(u, P0, C, P1, 4)
        mx, my = qpt(P0, C, P1, .5); o += f'<line x1="0" y1="{my:.1f}" x2="0" y2="{my+18:.1f}" stroke="url(#gMv{u})" stroke-width="3.4"/>' + stone(u, 'D', 0, my + 30, 12) + pear(u, stn, 0, my + 108, 64, 112, True, 14)
    elif kind == 'pendant_pearl':
        C = (0, 170); P0, P1 = (-170, -170), (170, -170); o += chain(u, P0, C, P1, 4)
        mx, my = qpt(P0, C, P1, .5); o += f'<line x1="0" y1="{my:.1f}" x2="0" y2="{my+14:.1f}" stroke="url(#gMv{u})" stroke-width="3.4"/>' + stone(u, 'D', 0, my + 28, 16) + claws(u, 0, my + 28, 18) + f'<path d="M-18,{my+46:.1f} Q0,{my+58:.1f} 18,{my+46:.1f} L12,{my+66:.1f} L-12,{my+66:.1f}Z" fill="url(#gMv{u})" stroke="#000" stroke-opacity=".25"/>' + stone(u, 'P', 0, my + 108, 46)
    elif kind == 'pendant_lotus':
        C = (0, 170); P0, P1 = (-170, -170), (170, -170); o += chain(u, P0, C, P1, 4)
        mx, my = qpt(P0, C, P1, .5); o += f'<line x1="0" y1="{my:.1f}" x2="0" y2="{my+16:.1f}" stroke="url(#gMv{u})" stroke-width="3.4"/>' + medallion(u, 0, my + 78, 62, stn)
    return o

def set_piece(u, kind, stn):
    neck = {'bridal_set': 'bridal', 'diamond_set': 'riviera', 'emerald_set': 'maharani', 'pearl_set': 'pearl'}[kind]
    ear = {'bridal_set': 'chandelier', 'diamond_set': 'drop', 'emerald_set': 'drop', 'pearl_set': 'pearl'}[kind]
    n = f'<g transform="translate(0 -158) scale(.95)">{necklace(u, neck, stn)}</g>'
    e = ''.join(f'<g transform="translate({sx*108} 222) scale(.82)">{earring(u, ear, stn)}</g>' for sx in (-1, 1))
    return n + e

# ---------------------------------------------------------------- BRACELETS
def bracelet(u, kind, stn):
    o = ''
    if kind == 'tennis':
        rx, ry = 176, 78
        o += f'<ellipse cx="0" cy="3" rx="{rx}" ry="{ry}" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="24"/><ellipse cx="0" cy="0" rx="{rx}" ry="{ry}" fill="none" stroke="url(#gM{u})" stroke-width="22"/>'
        for x, y, a in sorted(along_ellipse(0, 0, rx, ry, 36), key=lambda p: p[1]):
            sc = .72 + .28 * (math.sin(math.radians(a)) + 1) / 2
            o += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{13*sc+2.4:.1f}" fill="url(#gM{u})"/>' + stone(u, stn if stn != 'D' else 'D', x, y, 12 * sc)
    elif kind == 'bangle':
        o += gold_ellipse(u, 0, 0, 150, 138, 34, rot=-18)
        for i, (x, y, a) in enumerate(along_ellipse(0, 0, 150, 138, 36)):
            if i % 2 == 0: o += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="2" fill="#000" opacity=".25" transform="rotate(-18)"/>'
    elif kind == 'diamond_bangle':
        o += gold_ellipse(u, 0, 0, 150, 138, 34, rot=-18)
        o += '<g transform="rotate(-18)">' + ''.join(stone(u, 'D', x, y, 8.2) for x, y, a in along_ellipse(0, 0, 150, 138, 34)) + '</g>'
    elif kind == 'stack':
        for rr, dy, rot, pv in [(158, 40, -20, False), (146, 0, -14, True), (134, -40, -8, False)]:
            o += gold_ellipse(u, 0, dy, rr, rr * .72, 24 if not pv else 26, rot=rot)
            if pv: o += f'<g transform="rotate({rot} 0 {dy})">' + ''.join(stone(u, 'D', x, y, 6) for x, y, a in along_ellipse(0, dy, rr, rr * .72, 30)) + '</g>'
    elif kind == 'cuff':
        pts = along_ellipse(0, 0, 150, 130, 60, 40, 330)
        d = 'M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y, a in pts)
        o += f'<path d="{d}" fill="none" stroke="#000" stroke-opacity=".3" stroke-width="46" stroke-linecap="round" transform="translate(0 4) rotate(-14)"/><path d="{d}" fill="none" stroke="url(#gM{u})" stroke-width="44" stroke-linecap="round" transform="rotate(-14)"/><path d="{d}" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width="3" stroke-linecap="round" stroke-dasharray="120 14" transform="translate(0 -10) rotate(-14)"/>'
    elif kind == 'station':
        rx, ry = 176, 78
        o += f'<ellipse cx="0" cy="3" rx="{rx}" ry="{ry}" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="5"/><ellipse cx="0" cy="0" rx="{rx}" ry="{ry}" fill="none" stroke="url(#gM{u})" stroke-width="4"/>'
        for a in [20, 55, 90, 125, 160]:
            x, y = rx * math.cos(math.radians(a)), ry * math.sin(math.radians(a))
            o += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="22" fill="url(#gM{u})" stroke="#000" stroke-opacity=".25"/>' + stone(u, stn, x, y, 16.5)
    elif kind == 'charm':
        rx, ry = 176, 78
        o += f'<ellipse cx="0" cy="3" rx="{rx}" ry="{ry}" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="5"/><ellipse cx="0" cy="0" rx="{rx}" ry="{ry}" fill="none" stroke="url(#gM{u})" stroke-width="4" stroke-dasharray="6 2.5"/>'
        for a in [30, 70, 110, 150]:
            x, y = rx * math.cos(math.radians(a)), ry * math.sin(math.radians(a))
            o += stone(u, 'P' if a != 110 else 'D', x, y, 16 if a != 110 else 14)
    return o

# ---------------------------------------------------------------- CATALOG PLACEMENT
def piece(u, cat_kind, design, stn):
    return {'ring': ring, 'earring': earring, 'necklace': necklace, 'bracelet': bracelet, 'set': set_piece}[cat_kind](u, design, stn)

PLACE = {  # (cx, cy, scale, focalx, focaly, pair)
  'ring': (500, 690, 2.25, 0, -112, False),
  'earring': (500, 640, 2.45, 0, -20, True),
  'necklace': (500, 590, 2.45, 0, 70, False),
  'bracelet': (500, 640, 2.0, 0, 40, False),
  'set': (500, 640, 1.95, 0, -60, False),
}
PLACE_OVR = {'pendant': (500, 520, 2.5, 0, 40, False)}

def bokeh(u, rnd, w, h, n, dark=True, blur=1):
    o = ''
    for i in range(n):
        x, y, r = rnd.uniform(0, w), rnd.uniform(0, h), rnd.uniform(22, 90)
        col = rnd.choice(['#F0D6A0', '#D4B895', '#FFF1D2', '#B99A70'])
        o += f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r:.0f}" fill="{col}" opacity="{rnd.uniform(.05, .22) if dark else rnd.uniform(.08,.3):.2f}" filter="url(#{"bl" if blur==1 else "bl2"}{u})"/>'
    return o

def backdrop(u, mode, w, h, rnd, seed_hue=0):
    if mode == 'light':
        b = (f'<linearGradient id="bgA{u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7F1E8"/><stop offset=".62" stop-color="#EBDFCC"/><stop offset="1" stop-color="#D9C7AC"/></linearGradient>'
             f'<radialGradient id="bgB{u}" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".85"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>'
             f'<linearGradient id="fl{u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CDB99A" stop-opacity="0"/><stop offset="1" stop-color="#B99A70" stop-opacity=".45"/></linearGradient>')
        return b, (f'<rect width="{w}" height="{h}" fill="url(#bgA{u})"/><rect width="{w}" height="{h}" fill="url(#bgB{u})"/>'
                   f'<rect y="{h*.72}" width="{w}" height="{h*.28}" fill="url(#fl{u})"/><rect width="{w}" height="{h}" filter="url(#nz{u})" opacity=".16"/>'
                   + bokeh(u, rnd, w, h * .6, 4, False, 2))
    if mode == 'dark':
        b = (f'<radialGradient id="bgA{u}" cx=".5" cy=".46" r=".78"><stop offset="0" stop-color="#4A3724"/><stop offset=".5" stop-color="#241B13"/><stop offset="1" stop-color="#0E0C0A"/></radialGradient>'
             f'<linearGradient id="bm{u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F0D6A0" stop-opacity=".14"/><stop offset="1" stop-color="#F0D6A0" stop-opacity="0"/></linearGradient>')
        return b, (f'<rect width="{w}" height="{h}" fill="url(#bgA{u})"/><polygon points="{w*.1},0 {w*.42},0 {w*.9},{h} {w*.45},{h}" fill="url(#bm{u})"/>'
                   + bokeh(u, rnd, w, h, 14, True) + f'<rect width="{w}" height="{h}" filter="url(#nz{u})" opacity=".12"/>')
    # blush / mid-tone
    b = (f'<radialGradient id="bgA{u}" cx=".5" cy=".5" r=".75"><stop offset="0" stop-color="#E9D6BC"/><stop offset=".6" stop-color="#B99A70"/><stop offset="1" stop-color="#5A4128"/></radialGradient>')
    return b, f'<rect width="{w}" height="{h}" fill="url(#bgA{u})"/>' + bokeh(u, rnd, w, h, 16, False, 2) + f'<rect width="{w}" height="{h}" filter="url(#nz{u})" opacity=".12"/>'

def render_view(pid, cat_kind, design, stn, metal, view, placement_key=None, w=1000, h=1250):
    u = pid[:3].replace('-', '') + view
    rnd = random.Random(hash(pid) % 100000 + ord(view))
    cx, cy, sc, fx, fy, pair = PLACE_OVR.get(placement_key, PLACE[cat_kind])
    small = design in ('stud', 'cluster', 'pavestud')
    if small: sc *= 1.55
    macro = {'ring': 2.1, 'earring': 1.35, 'necklace': 1.7, 'bracelet': 1.55, 'set': 1.7}[cat_kind] * (0.62 if small else 1) * (0.72 if design in ('chandelier','hoop','jhumka') else 1) * (1.2 if placement_key == 'pendant' else 1)
    mode = {'a': 'light', 'b': 'dark', 'c': 'blush'}[view]
    bdefs, bg = backdrop(u, mode, w, h, rnd)
    body = piece(u, cat_kind, design, stn)
    if pair:
        sp = 70 if small else 112
        grp = f'<g transform="translate({-sp} 0)">{body}</g><g transform="translate({sp} 0) scale(-1 1)">{body}</g>'
    else:
        grp = body
    if view == 'a':
        T = f'translate({cx} {cy}) scale({sc}) translate({-0} {0})'
        ground = f'<ellipse cx="{cx}" cy="{cy+ (190 if cat_kind=="ring" else 250)*sc*.95:.0f}" rx="{230*sc/1.6:.0f}" ry="{22:.0f}" fill="#241F1B" opacity=".18" filter="url(#bl{u})"/>' if cat_kind == 'ring' else ''
        art = f'{ground}<g transform="{T}" filter="url(#ds{u})">{grp}</g>'
    elif view == 'b':
        T = f'translate({cx} {cy-10}) scale({sc*1.06})'
        glow = f'<ellipse cx="{cx}" cy="{cy}" rx="{330*sc/1.7:.0f}" ry="{300*sc/1.7:.0f}" fill="#D4B895" opacity=".13" filter="url(#bl2{u})"/>'
        art = f'{glow}<g transform="{T}" filter="url(#dsd{u})">{grp}</g>'
    else:
        S = sc * macro
        T = f'translate({w/2} {h*.5}) scale({S}) translate({-fx} {-fy})'
        art = f'<g transform="{T}" filter="url(#ds{u})">{grp}</g>'
    vig = f'<radialGradient id="vg{u}" cx=".5" cy=".5" r=".75"><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="{.38 if mode!="light" else .12}"/></radialGradient>'
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}"><defs>{defs(metal, u)}{bdefs}{vig}</defs>'
           f'{bg}{art}<rect width="{w}" height="{h}" fill="url(#vg{u})"/></svg>')
    return svg
