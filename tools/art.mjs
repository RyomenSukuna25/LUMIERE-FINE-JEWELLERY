// Procedural jewellery imagery. Output: 1200x1500 SVG strings, rendered to JPG by tools/render.py.
// These are created studio-style renders (no web screenshots, no template crops, no baked text).

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const f = (n) => Math.round(n * 10) / 10;
const polar = (cx, cy, r, deg) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];
const circlePath = (cx, cy, r) => `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0 Z`;

const METALS = {
  rose: ['#fbe4d2', '#e3ae90', '#c4836a', '#8d5642', '#f2cdb6'],
  yellow: ['#fff0b8', '#e8c366', '#bd912f', '#7d5a1b', '#f6dc8c'],
  white: ['#ffffff', '#dfe3e8', '#aab0b9', '#6d7480', '#f0f2f5'],
};
const STONES = {
  diamond: { h: 212, s: 12, L: [52, 99] },
  emerald: { h: 152, s: 72, L: [16, 56] },
  ruby: { h: 351, s: 80, L: [20, 58] },
  sapphire: { h: 224, s: 78, L: [18, 58] },
  morganite: { h: 14, s: 64, L: [52, 88] },
};

const BGS = {
  sand: { a: '#f1e6d3', b: '#cfb592', c: '#8c7048', floor: ['#d9c3a0', '#a98a60'], dark: false },
  noir: { a: '#3a2b1e', b: '#150f0b', c: '#070605', floor: ['#2a1f16', '#0c0907'], dark: true },
  ivory: { a: '#fbf7ef', b: '#eadfcc', c: '#cdbb9d', floor: ['#efe5d3', '#d8c9ae'], dark: false },
  stone: { a: '#6a5b4d', b: '#3a3029', c: '#1c1612', floor: ['#4d4036', '#271f19'], dark: true },
  blush: { a: '#f6e3da', b: '#e3bfb0', c: '#b78c7c', floor: ['#ecd0c3', '#c9a193'], dark: false },
  silk: { a: '#f4e8d6', b: '#d7bd98', c: '#8f7550', floor: ['#e2cba8', '#b08f64'], dark: false },
};

function metalDefs(id, m) {
  const c = METALS[m] || METALS.yellow;
  return `
  <linearGradient id="mg${id}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${c[0]}"/><stop offset=".18" stop-color="${c[1]}"/><stop offset=".34" stop-color="${c[4]}"/>
    <stop offset=".52" stop-color="${c[2]}"/><stop offset=".72" stop-color="${c[3]}"/><stop offset=".86" stop-color="${c[2]}"/><stop offset="1" stop-color="${c[1]}"/>
  </linearGradient>
  <linearGradient id="mh${id}" x1="0" y1="1" x2="1" y2="0">
    <stop offset="0" stop-color="${c[3]}"/><stop offset=".4" stop-color="${c[2]}"/><stop offset=".7" stop-color="${c[4]}"/><stop offset="1" stop-color="${c[0]}"/>
  </linearGradient>`;
}

function sparkle(x, y, s, o = 0.9) {
  const a = s, b = s * 0.12;
  return `<path d="M${x},${y - a} Q${x + b},${y - b} ${x + a},${y} Q${x + b},${y + b} ${x},${y + a} Q${x - b},${y + b} ${x - a},${y} Q${x - b},${y - b} ${x},${y - a}Z" fill="#fff" opacity="${o}" filter="url(#glow)"/>`;
}

// Round brilliant, seen from above. Returns SVG group centred at 0,0 then positioned.
function brilliant(cx, cy, R, kind, r, opts = {}) {
  const { sq = 1, rot = 0 } = opts;
  if (kind === 'pearl') {
    return `<g transform="translate(${cx},${cy})"><circle r="${R}" fill="url(#pearl)"/><ellipse cx="${-R * 0.35}" cy="${-R * 0.4}" rx="${R * 0.28}" ry="${R * 0.18}" fill="#fff" opacity=".75" transform="rotate(-35 ${-R * 0.35} ${-R * 0.4})"/></g>`;
  }
  const P = STONES[kind] || STONES.diamond;
  const O = [], M = [], T = [];
  for (let j = 0; j < 16; j++) O.push(polar(0, 0, R, j * 22.5 + rot));
  for (let i = 0; i < 8; i++) { M.push(polar(0, 0, R * 0.68, i * 45 + 22.5 + rot)); T.push(polar(0, 0, R * 0.42, i * 45 + rot)); }
  const phase = r() * 6;
  const col = (ang, depth) => {
    const t = (Math.sin((ang * Math.PI) / 180 * 2 + phase) + 1) / 2;
    const jit = (r() - 0.5) * 0.28;
    const k = Math.min(1, Math.max(0, t * 0.75 + jit + (1 - depth) * 0.25));
    const L = P.L[0] + (P.L[1] - P.L[0]) * k;
    let h = P.h;
    if (kind === 'diamond' && r() > 0.82) h = 28; // warm flash
    const s = kind === 'diamond' ? (r() > 0.82 ? 38 : P.s) : P.s - (k > 0.8 ? 20 : 0);
    return `hsl(${h} ${s}% ${L}%)`;
  };
  const poly = (pts, c) => `<polygon points="${pts.map((p) => `${f(p[0])},${f(p[1])}`).join(' ')}" fill="${c}" stroke="rgba(255,255,255,.28)" stroke-width="${Math.max(0.6, R / 90)}" stroke-linejoin="round"/>`;
  let out = `<g transform="translate(${cx},${cy}) scale(1,${sq})">`;
  out += `<circle r="${R * 1.03}" fill="rgba(0,0,0,.35)"/>`;
  for (let i = 0; i < 8; i++) {
    const n = (i + 1) % 8, p = (i + 7) % 8;
    out += poly([O[2 * i], O[2 * i + 1], M[i]], col(i * 45 + 11, 0.3));
    out += poly([M[i], O[2 * i + 1], O[(2 * i + 2) % 16]], col(i * 45 + 33, 0.3));
    out += poly([T[i], M[p], O[2 * i], M[i]], col(i * 45, 0.55));
    out += poly([T[i], M[i], T[n]], col(i * 45 + 22, 0.8));
  }
  out += poly(T, col(40, 1));
  out += `<circle r="${R}" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="${R / 60}"/></g>`;
  return out;
}

// A faceted free-form shape (pear/oval/marquise), clipped fan of facets.
let clipN = 0;
function facetedShape(d, cx, cy, W, H, kind, r) {
  const P = STONES[kind] || STONES.diamond;
  const id = `fc${clipN++}`;
  let out = `<clipPath id="${id}"><path d="${d}"/></clipPath><g clip-path="url(#${id})">`;
  const pts = [];
  const N = 14;
  for (let i = 0; i < N; i++) pts.push([cx + (W * 0.9) * Math.cos((i / N) * Math.PI * 2), cy + (H * 0.9) * Math.sin((i / N) * Math.PI * 2)]);
  const inner = pts.map((p, i) => [cx + (p[0] - cx) * 0.46, cy + (p[1] - cy) * 0.46]);
  const phase = r() * 6;
  const L = (k) => P.L[0] + (P.L[1] - P.L[0]) * k;
  const colr = (a, base) => {
    const k = Math.min(1, Math.max(0, ((Math.sin(a * 2 + phase) + 1) / 2) * 0.7 + (r() - 0.5) * 0.3 + base));
    return `hsl(${P.h} ${P.s}% ${L(k)}%)`;
  };
  for (let i = 0; i < N; i++) {
    const n = (i + 1) % N;
    out += `<polygon points="${pts[i]} ${pts[n]} ${inner[n]} ${inner[i]}" fill="${colr((i / N) * 6.28, 0.05)}" stroke="rgba(255,255,255,.3)" stroke-width="1"/>`;
    out += `<polygon points="${inner[i]} ${inner[n]} ${cx},${cy}" fill="${colr((i / N) * 6.28 + 1, 0.22)}" stroke="rgba(255,255,255,.3)" stroke-width="1"/>`;
  }
  out += `</g><path d="${d}" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1.6"/>`;
  return out;
}
function pearPath(cx, top, W, H) {
  const b = top + H;
  return `M${cx},${top} C${cx + W * 0.55},${top + H * 0.3} ${cx + W},${top + H * 0.62} ${cx + W * 0.62},${b - H * 0.06} C${cx + W * 0.3},${b + H * 0.05} ${cx - W * 0.3},${b + H * 0.05} ${cx - W * 0.62},${b - H * 0.06} C${cx - W},${top + H * 0.62} ${cx - W * 0.55},${top + H * 0.3} ${cx},${top}Z`;
}
function pear(cx, top, W, H, kind, r, id) {
  if (kind === 'pearl') {
    const R = W * 0.9;
    return `<circle cx="${cx}" cy="${top + R}" r="${R}" fill="url(#pearl)"/><ellipse cx="${cx - R * 0.35}" cy="${top + R * 0.6}" rx="${R * 0.26}" ry="${R * 0.16}" fill="#fff" opacity=".7" transform="rotate(-35 ${cx - R * 0.35} ${top + R * 0.6})"/>`;
  }
  const d = pearPath(cx, top, W, H);
  const bez = pearPath(cx, top - 6, W * 1.18, H * 1.1);
  return `<path d="${bez}" fill="url(#mg${id})" stroke="rgba(0,0,0,.25)" stroke-width="1.5"/>` + facetedShape(d, cx, top + H * 0.58, W, H * 0.5, kind, r);
}

function pavéDots(points, size, kind, r) {
  return points.map(([x, y]) => `<circle cx="${f(x)}" cy="${f(y)}" r="${size * 1.25}" fill="rgba(0,0,0,.35)"/>` + brilliant(x, y, size, kind, r)).join('');
}

// ---------- pieces ----------
function ringPiece(s, id, r) {
  const cx = 600, cy = 960, ro = 330;
  const wide = s.style === 'band' || s.style === 'eternity' || s.style === 'pave';
  const ri = wide ? 252 : 274;
  const kind = s.stoneKind;
  let g = '';
  g += `<path d="${circlePath(cx, cy, ro)} ${circlePath(cx, cy, ri)}" fill="url(#mg${id})" fill-rule="evenodd"/>`;
  g += `<path d="${circlePath(cx, cy, ro - 14)} ${circlePath(cx, cy, ro - 30)}" fill="url(#mh${id})" fill-rule="evenodd" opacity=".55"/>`;
  g += `<circle cx="${cx}" cy="${cy}" r="${ri}" fill="none" stroke="rgba(0,0,0,.4)" stroke-width="8"/>`;
  const [x1, y1] = polar(cx, cy, (ro + ri) / 2, 205), [x2, y2] = polar(cx, cy, (ro + ri) / 2, 255);
  g += `<path d="M${x1},${y1} A${(ro + ri) / 2},${(ro + ri) / 2} 0 0 1 ${x2},${y2}" stroke="#fff" stroke-opacity=".6" stroke-width="9" fill="none" stroke-linecap="round" filter="url(#soft)"/>`;
  const mid = (ro + ri) / 2;
  if (s.style === 'pave' || s.style === 'eternity') {
    const span = s.style === 'eternity' ? [0, 360] : [-148, -32];
    const cnt = s.style === 'eternity' ? 34 : 17;
    const pts = [];
    for (let i = 0; i < cnt; i++) pts.push(polar(cx, cy, mid, span[0] + ((span[1] - span[0]) * i) / (s.style === 'eternity' ? cnt : cnt - 1)));
    g += pavéDots(pts, s.style === 'eternity' ? 22 : 17, kind === 'none' ? 'diamond' : kind, r);
  }
  if (s.style === 'band') {
    g += `<path d="${circlePath(cx, cy, mid + 22)} ${circlePath(cx, cy, mid + 18)}" fill="rgba(0,0,0,.28)" fill-rule="evenodd"/>`;
    g += `<path d="${circlePath(cx, cy, mid - 22)} ${circlePath(cx, cy, mid - 26)}" fill="rgba(0,0,0,.22)" fill-rule="evenodd"/>`;
  }
  const hasHead = !['band', 'eternity'].includes(s.style);
  if (hasHead) {
    const Rs = s.style === 'pave' ? 110 : s.style === 'trilogy' ? 100 : 128;
    const sy = cy - ro - Rs * 0.35;
    const sq = s.style === 'solitaire-oval' ? 1.22 : 1;
    // cradle
    g += `<path d="M${cx - 70},${cy - ro + 30} L${cx - Rs * 0.7},${sy + Rs * 0.2} L${cx + Rs * 0.7},${sy + Rs * 0.2} L${cx + 70},${cy - ro + 30}Z" fill="url(#mg${id})" stroke="rgba(0,0,0,.25)" stroke-width="2"/>`;
    if (s.style === 'halo' || s.style === 'cluster') {
      const hr = Rs + 34;
      g += `<circle cx="${cx}" cy="${sy}" r="${hr + 14}" fill="url(#mg${id})" stroke="rgba(0,0,0,.25)" stroke-width="2"/>`;
      const n = s.style === 'cluster' ? 8 : 16, sz = s.style === 'cluster' ? 42 : 17;
      const dist = s.style === 'cluster' ? Rs + 40 : hr;
      const pts = []; for (let i = 0; i < n; i++) pts.push(polar(cx, sy, dist, (i * 360) / n));
      g += pavéDots(pts, sz, s.style === 'cluster' ? 'diamond' : 'diamond', r);
    }
    if (s.style === 'trilogy') {
      g += `<ellipse cx="${cx}" cy="${sy + 20}" rx="${Rs * 2.3}" ry="${Rs * 0.7}" fill="url(#mg${id})" stroke="rgba(0,0,0,.25)" stroke-width="2"/>`;
      g += brilliant(cx - Rs * 1.5, sy + 24, Rs * 0.62, kind, r) + brilliant(cx + Rs * 1.5, sy + 24, Rs * 0.62, kind, r);
    }
    g += `<circle cx="${cx}" cy="${sy}" r="${Rs * 1.1}" fill="url(#mh${id})" stroke="rgba(0,0,0,.3)" stroke-width="2" transform="translate(0 ${(sy)*0}) " opacity="${sq > 1 ? 0 : 1}"/>`;
    g += brilliant(cx, sy, Rs, kind, r, { sq });
    const prongs = s.style === 'solitaire-oval' ? 4 : 6;
    for (let i = 0; i < prongs; i++) {
      const a = (i * 360) / prongs + 30;
      const [px, py] = polar(cx, sy, Rs * 1.02, a);
      g += `<ellipse cx="${f(px)}" cy="${f(py * 1 + (sq > 1 ? (py - sy) * 0.22 : 0))}" rx="${Rs * 0.09}" ry="${Rs * 0.09}" fill="url(#mg${id})" stroke="rgba(0,0,0,.35)" stroke-width="1.4"/>`;
    }
    g += sparkle(cx - Rs * 0.3, sy - Rs * 0.45, Rs * 0.7) + sparkle(cx + Rs * 0.5, sy + Rs * 0.2, Rs * 0.35, 0.8);
  }
  return { svg: g, focal: hasHead ? [600, 560, 520] : [600, 700, 760], floorY: cy + ro + 4 };
}

function earringsPiece(s, id, r) {
  const kind = s.stoneKind;
  let g = '';
  const single = (x, flip) => {
    let e = '';
    const hookTop = 220;
    if (s.style === 'studs') {
      const R = 150;
      e += `<ellipse cx="${x}" cy="720" rx="${R + 34}" ry="${R + 34}" fill="url(#mg${id})" stroke="rgba(0,0,0,.3)" stroke-width="2"/>`;
      e += `<circle cx="${x}" cy="720" r="${R + 14}" fill="url(#mh${id})" opacity=".8"/>`;
      e += brilliant(x, 720, R, kind, r);
      for (let i = 0; i < 4; i++) { const [px, py] = polar(x, 720, R + 6, i * 90 + 45); e += `<circle cx="${f(px)}" cy="${f(py)}" r="15" fill="url(#mg${id})" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/>`; }
      e += sparkle(x - 40, 650, 90);
      return e;
    }
    if (s.style === 'hoops') {
      e += `<ellipse cx="${x}" cy="700" rx="190" ry="300" fill="none" stroke="url(#mg${id})" stroke-width="64"/>`;
      e += `<ellipse cx="${x}" cy="700" rx="190" ry="300" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="8" stroke-dasharray="360 2000" stroke-dashoffset="-650" filter="url(#soft)"/>`;
      const pts = []; for (let i = 0; i < 17; i++) { const a = 195 + i * 9.5; pts.push([x + 190 * Math.cos((a * Math.PI) / 180), 700 + 300 * Math.sin((a * Math.PI) / 180)]); }
      e += pavéDots(pts, 18, 'diamond', r);
      return e;
    }
    // hook + stud
    e += `<path d="M${x},${hookTop - 120} q${flip * 40},-40 ${flip * 40},-4 L${x + flip * 40},${hookTop}" stroke="url(#mg${id})" stroke-width="10" fill="none" stroke-linecap="round"/>`;
    e += `<circle cx="${x}" cy="${hookTop + 50}" r="68" fill="url(#mg${id})" stroke="rgba(0,0,0,.3)" stroke-width="2"/>`;
    e += brilliant(x, hookTop + 50, kind === 'pearl' ? 40 : 46, kind === 'pearl' ? 'diamond' : kind, r);
    if (s.style === 'chandelier') {
      e += `<path d="M${x - 120},${hookTop + 150} Q${x},${hookTop + 90} ${x + 120},${hookTop + 150} L${x + 90},${hookTop + 210} Q${x},${hookTop + 170} ${x - 90},${hookTop + 210}Z" fill="url(#mg${id})" stroke="rgba(0,0,0,.3)" stroke-width="2"/>`;
      const bar = []; for (let i = 0; i < 7; i++) bar.push([x - 90 + i * 30, hookTop + 168 + Math.sin((i / 6) * Math.PI) * -12]);
      e += pavéDots(bar, 13, 'diamond', r);
      const drops = [[-96, 250, 92], [-48, 340, 110], [0, 430, 140], [48, 340, 110], [96, 250, 92]];
      drops.forEach(([dx, len, H], i) => {
        e += `<line x1="${x + dx}" y1="${hookTop + 205}" x2="${x + dx}" y2="${hookTop + 205 + len - 120}" stroke="url(#mg${id})" stroke-width="6"/>`;
        e += pear(x + dx, hookTop + 205 + len - 120, i === 2 ? 40 : 30, i === 2 ? 140 : 100, kind, r, id);
      });
      return e;
    }
    // drop
    const startY = hookTop + 120;
    e += `<line x1="${x}" y1="${startY}" x2="${x}" y2="${startY + 130}" stroke="url(#mg${id})" stroke-width="9"/>`;
    e += `<circle cx="${x}" cy="${startY + 150}" r="20" fill="url(#mg${id})"/>`;
    e += pear(x, startY + 176, kind === 'pearl' ? 56 : 62, kind === 'pearl' ? 130 : 270, kind, r, id);
    e += sparkle(x - 14, startY + 280, 60);
    return e;
  };
  g += single(390, 1) + single(810, -1);
  return { svg: g, focal: [600, 640, 760], floorY: 1330 };
}

function chainOnPath(p, id, wd = 7) {
  const d = `M${p.x0},${p.y0} Q${p.cx},${p.cy} ${p.x1},${p.y1}`;
  return `<path d="${d}" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="${wd + 4}" stroke-linecap="round" transform="translate(3 5)" filter="url(#soft)"/>
  <path d="${d}" fill="none" stroke="url(#mg${id})" stroke-width="${wd}" stroke-linecap="round" stroke-dasharray="${wd * 1.3} ${wd * 0.5}"/>
  <path d="${d}" fill="none" stroke="url(#mh${id})" stroke-width="${wd * 0.45}" stroke-linecap="round" stroke-dasharray="${wd * 0.9} ${wd * 0.9}" opacity=".9"/>`;
}
const quad = (p, t) => [(1 - t) * (1 - t) * p.x0 + 2 * (1 - t) * t * p.cx + t * t * p.x1, (1 - t) * (1 - t) * p.y0 + 2 * (1 - t) * t * p.cy + t * t * p.y1];
function necklacePiece(s, id, r, offset = { x: 0, y: 0, k: 1 }) {
  const kind = s.stoneKind;
  const p = { x0: 150, y0: 150, cx: 600, cy: 1560, x1: 1050, y1: 150 };
  let g = '';
  if (s.style === 'collar' || s.style.startsWith('set-collar')) {
    const d = `M${p.x0},${p.y0} Q${p.cx},${p.cy - 380} ${p.x1},${p.y1}`;
    const q = { ...p, cy: p.cy - 380 };
    g += `<path d="${d}" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="70" stroke-linecap="round" transform="translate(4 8)" filter="url(#soft)"/>`;
    g += `<path d="${d}" fill="none" stroke="url(#mg${id})" stroke-width="64" stroke-linecap="round"/>`;
    const pts = [];
    for (let i = 0; i <= 18; i++) pts.push(quad(q, i / 18));
    g += pavéDots(pts, 21, kind === 'pearl' ? 'diamond' : kind === 'diamond' ? 'diamond' : 'diamond', r);
    const drops = [];
    for (let i = 3; i <= 15; i += 2) drops.push(i);
    drops.forEach((i, k) => {
      const [x, y] = quad(q, i / 18);
      const mid = Math.abs(k - 3) ;
      const H = 190 - mid * 22, W = 58 - mid * 5;
      g += `<line x1="${f(x)}" y1="${f(y)}" x2="${f(x)}" y2="${f(y + 36)}" stroke="url(#mg${id})" stroke-width="7"/>`;
      g += pear(x, y + 36, W, H, kind === 'diamond' ? 'diamond' : kind, r, id);
    });
    return { svg: g, focal: [600, 760, 640], floorY: 1360 };
  }
  g += chainOnPath(p, id, 7);
  if (s.style === 'pendant') {
    const p2 = { x0: 230, y0: 120, cx: 600, cy: 1100, x1: 970, y1: 120 };
    g = chainOnPath(p2, id, 8);
    const [x, y] = quad(p2, 0.5);
    g += `<circle cx="${x}" cy="${y + 20}" r="24" fill="none" stroke="url(#mg${id})" stroke-width="9"/>`;
    if (kind === 'pearl') { g += `<circle cx="${x}" cy="${y + 64}" r="16" fill="url(#mg${id})"/>` + `<circle cx="${x}" cy="${y + 190}" r="110" fill="url(#pearl)"/><ellipse cx="${x - 40}" cy="${y + 150}" rx="30" ry="18" fill="#fff" opacity=".7" transform="rotate(-35 ${x - 40} ${y + 150})"/>`; }
    else {
      g += `<circle cx="${x}" cy="${y + 205}" r="${kind === 'emerald' ? 130 : 118}" fill="url(#mg${id})" stroke="rgba(0,0,0,.3)" stroke-width="2"/>`;
      g += brilliant(x, y + 205, kind === 'emerald' ? 104 : 94, kind, r);
      g += sparkle(x - 30, y + 160, 90);
    }
    return { svg: g, focal: [600, 680, 520], floorY: 1300 };
  }
  const n = s.style === 'riviere' ? 17 : 9;
  for (let i = 0; i < n; i++) {
    const t = 0.2 + (0.6 * i) / (n - 1);
    const [x, y] = quad(p, t);
    const e = 1 - Math.abs(i - (n - 1) / 2) / ((n - 1) / 2);
    const sz = (s.style === 'riviere' ? 20 : 20) + e * (s.style === 'riviere' ? 26 : 32);
    g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(sz * 1.35)}" fill="url(#mg${id})" stroke="rgba(0,0,0,.3)" stroke-width="1.6"/>` + brilliant(x, y, sz, kind === 'pearl' ? 'diamond' : kind, r);
  }
  const [mx, my] = quad(p, 0.5);
  g += sparkle(mx - 30, my - 20, 80);
  return { svg: g, focal: [600, 840, 640], floorY: 1360 };
}

function braceletPiece(s, id, r) {
  const kind = s.stoneKind === 'none' ? 'diamond' : s.stoneKind;
  const cx = 600, cy = 820, rx = 440, ry = 230;
  let g = '';
  const ell = (rx2, ry2) => `M${cx - rx2},${cy} a${rx2},${ry2} 0 1,0 ${2 * rx2},0 a${rx2},${ry2} 0 1,0 ${-2 * rx2},0Z`;
  if (s.style === 'bangle' || s.style === 'cuff') {
    const w = s.style === 'cuff' ? 86 : 74;
    // back inner wall
    g += `<ellipse cx="${cx}" cy="${cy + 6}" rx="${rx - w / 2 + 6}" ry="${ry - w / 2 + 2}" fill="rgba(0,0,0,.45)"/>`;
    g += `<path d="M${cx - rx},${cy} a${rx},${ry} 0 0,1 ${2 * rx},0" fill="none" stroke="url(#mh${id})" stroke-width="${w * 0.8}" opacity=".85"/>`;
    g += `<path d="M${cx - rx},${cy} a${rx},${ry} 0 0,0 ${2 * rx},0" fill="none" stroke="url(#mg${id})" stroke-width="${w}"/>`;
    g += `<path d="M${cx - rx + 40},${cy + 70} a${rx - 40},${ry - 30} 0 0,0 ${2 * (rx - 40) - 60},${40}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="10" stroke-linecap="round" filter="url(#soft)"/>`;
    g += `<path d="M${cx - rx},${cy} a${rx},${ry} 0 0,0 ${2 * rx},0" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="3" transform="translate(0 ${w / 2 - 2})"/>`;
    if (s.style === 'cuff') {
      g += `<circle cx="${cx + rx - 4}" cy="${cy + 4}" r="52" fill="url(#mh${id})" stroke="rgba(0,0,0,.3)" stroke-width="2"/>`;
      g += `<circle cx="${cx - rx + 4}" cy="${cy + 4}" r="52" fill="url(#mh${id})" stroke="rgba(0,0,0,.3)" stroke-width="2"/>`;
    }
    return { svg: g, focal: [600, 1000, 760], floorY: 1130 };
  }
  // tennis
  g += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="48" transform="translate(4 10)" filter="url(#soft)"/>`;
  const N = 36;
  const back = [], front = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a);
    const depth = (Math.sin(a) + 1) / 2;
    (Math.sin(a) < 0 ? back : front).push([x, y, 18 + depth * 24]);
  }
  const draw = (arr, dim) => arr.map(([x, y, sz]) => `<rect x="${f(x - sz * 1.3)}" y="${f(y - sz * 1.3)}" width="${f(sz * 2.6)}" height="${f(sz * 2.6)}" rx="${f(sz * 0.6)}" fill="url(#mg${id})" stroke="rgba(0,0,0,.3)" stroke-width="1.4" ${dim ? 'opacity=".8"' : ''}/>` + brilliant(x, y, sz, kind, r)).join('');
  g += draw(back, true);
  g += `<path d="M${cx - rx},${cy} a${rx},${ry} 0 0,0 ${2 * rx},0" fill="none" stroke="url(#mg${id})" stroke-width="30" opacity=".9"/>`;
  g += draw(front, false);
  g += sparkle(cx - 160, cy + ry - 40, 100);
  return { svg: g, focal: [600, 1040, 760], floorY: 1130 };
}

function setPiece(s, id, r) {
  const style = s.style.replace('set-', '');
  const neck = necklacePiece({ ...s, style }, id, r);
  const ear = earringsPiece({ ...s, style: style === 'collar' ? 'chandelier' : 'drop' }, id, r);
  const g = `<g transform="translate(150 20) scale(.75)">${neck.svg}</g><g transform="translate(180 770) scale(.72)">${ear.svg}</g>`;
  return { svg: g, focal: [600, 700, 900], floorY: 1420 };
}

// ---------- backdrops ----------
function backdrop(bgKey, r, floorY, opts = {}) {
  const b = BGS[bgKey];
  let g = `<rect width="1200" height="1500" fill="url(#bg)"/>`;
  if (bgKey === 'silk') {
    for (let i = 0; i < 6; i++) {
      const y = 200 + i * 220, a = 60 + r() * 120;
      g += `<path d="M-50,${y} C250,${y - a} 500,${y + a} 800,${y - a / 2} S1150,${y + a} 1300,${y}" fill="none" stroke="rgba(255,255,255,${0.18 + r() * 0.2})" stroke-width="${80 + r() * 90}" filter="url(#blur30)"/>`;
      g += `<path d="M-50,${y + 40} C250,${y - a + 40} 500,${y + a + 40} 800,${y - a / 2 + 40} S1150,${y + a + 40} 1300,${y + 40}" fill="none" stroke="rgba(80,50,20,${0.1 + r() * 0.12})" stroke-width="${60 + r() * 60}" filter="url(#blur30)"/>`;
    }
  }
  // bokeh
  const nb = b.dark ? 26 : 16;
  for (let i = 0; i < nb; i++) {
    const x = r() * 1200, y = r() * 1000, rad = 20 + r() * (opts.big ? 120 : 70);
    g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rad)}" fill="${b.dark ? '#e0b66a' : '#fff'}" opacity="${b.dark ? 0.05 + r() * 0.12 : 0.1 + r() * 0.2}" filter="url(#blur12)"/>`;
  }
  // floor / surface
  const fy = Math.min(1400, floorY - 40);
  g += `<path d="M0,${fy} Q600,${fy - 60} 1200,${fy} L1200,1500 L0,1500Z" fill="url(#floor)"/>`;
  g += `<path d="M0,${fy} Q600,${fy - 60} 1200,${fy}" fill="none" stroke="rgba(255,255,255,${b.dark ? 0.16 : 0.5})" stroke-width="3"/>`;
  // contact shadow
  g += `<ellipse cx="600" cy="${fy + 6}" rx="420" ry="34" fill="rgba(0,0,0,${b.dark ? 0.6 : 0.3})" filter="url(#blur12)"/>`;
  return g;
}

function defs(bgKey, id, metal, rng2) {
  const b = BGS[bgKey];
  return `<defs>
  <radialGradient id="bg" cx=".62" cy=".28" r="1.05"><stop offset="0" stop-color="${b.a}"/><stop offset=".55" stop-color="${b.b}"/><stop offset="1" stop-color="${b.c}"/></radialGradient>
  <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${b.floor[0]}"/><stop offset="1" stop-color="${b.floor[1]}"/></linearGradient>
  <radialGradient id="pearl" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#f6ece4"/><stop offset=".8" stop-color="#d8c4b8"/><stop offset="1" stop-color="#9d8678"/></radialGradient>
  <radialGradient id="vig" cx=".5" cy=".45" r=".8"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${b.dark ? 0.55 : 0.22}"/></radialGradient>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter>
  <filter id="blur12" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12"/></filter>
  <filter id="blur30" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30"/></filter>
  <filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3"/></filter>
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="${hash(id) % 99}"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .45  0 0 0 0 .4  0 0 0 .22 0"/></filter>
  ${metalDefs(id, metal)}
  </defs>`;
}

export function renderProduct(p, viewIdx) {
  const view = p.views[viewIdx];
  const seed = hash(p.slug + viewIdx);
  const r = rng(seed);
  const id = 'p';
  const bgKey = view.bg;
  const spec = { style: p.style, stoneKind: p.stoneKind, metal: p.metal };
  let piece;
  if (p.category === 'Rings') piece = ringPiece(spec, id, r);
  else if (p.category === 'Earrings') piece = earringsPiece(spec, id, r);
  else if (p.category === 'Necklaces' || p.category === 'Pendants') piece = necklacePiece(spec, id, r);
  else if (p.category === 'Bracelets') piece = braceletPiece(spec, id, r);
  else piece = setPiece(spec, id, r);
  const br = rng(seed + 7);
  let transform = '', vb = view.key === 'main' ? '70 130 1060 1325' : '0 0 1200 1500';
  if (view.key === 'macro') {
    const [fx, fy, fs] = piece.focal;
    const w = fs * 1.15, h = w * 1.25;
    vb = `${f(Math.max(0, Math.min(1200 - w, fx - w / 2)))} ${f(Math.max(0, Math.min(1500 - h, fy - h / 2)))} ${f(w)} ${f(h)}`;
  }
  if (view.key === 'flat') transform = `rotate(${p.category === 'Rings' ? -14 : -9} 600 750) translate(0 20)`;
  const dark = BGS[bgKey].dark;
  const body = backdrop(bgKey, br, piece.floorY, { big: view.key === 'macro' }) +
    `<g transform="${transform}"><g filter="url(#drop)">${piece.svg}</g></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="1200" height="1500" preserveAspectRatio="xMidYMid slice">
  ${defs(bgKey, id, p.metal, br).replace('</defs>', `<filter id="drop" x="-10%" y="-10%" width="125%" height="125%"><feDropShadow dx="10" dy="18" stdDeviation="14" flood-color="#000" flood-opacity="${dark ? 0.7 : 0.38}"/></filter></defs>`)}
  ${body}
  <rect x="-2000" y="-2000" width="6000" height="6000" fill="url(#vig)"/>
  <rect x="-2000" y="-2000" width="6000" height="6000" filter="url(#grain)" opacity=".55"/>
  </svg>`;
}

// ---------- editorial scenes ----------
export function renderEditorial(e) {
  const r = rng(hash(e.id));
  const id = 'p';
  const palMap = { champagne: 'silk', noir: 'noir', blush: 'blush', diamond: 'noir', emerald: 'noir', ruby: 'noir', sand: 'sand', ivory: 'ivory' };
  const bgKey = palMap[e.pal] || 'sand';
  const b = BGS[bgKey];
  let body = '';
  const metal = 'yellow';
  if (e.scene === 'silk') {
    const tone = e.pal === 'noir' ? ['#2a1f17', '#0b0807', '#c79a58'] : e.pal === 'blush' ? ['#f6e3da', '#c99f91', '#fff5ee'] : ['#f3e6d2', '#c9aa7c', '#fff8ee'];
    body += `<rect width="1200" height="1500" fill="${tone[0]}"/>`;
    for (let i = 0; i < 9; i++) {
      const y0 = -100 + i * 190 + r() * 40, a = 90 + r() * 220;
      body += `<path d="M-100,${y0} C300,${y0 + a} 700,${y0 - a} 1300,${y0 + a * 0.6} L1300,${y0 + 260} C700,${y0 + 160 - a} 300,${y0 + 180 + a} -100,${y0 + 260}Z" fill="${i % 2 ? tone[1] : tone[0]}" opacity="${0.35 + r() * 0.45}" filter="url(#blur30)"/>`;
      body += `<path d="M-100,${y0 + 40} C300,${y0 + a + 40} 700,${y0 - a + 40} 1300,${y0 + a * 0.6 + 40}" stroke="${tone[2]}" stroke-opacity="${0.12 + r() * 0.35}" stroke-width="${6 + r() * 26}" fill="none" filter="url(#soft)"/>`;
    }
  } else if (e.scene === 'macro') {
    body += `<rect width="1200" height="1500" fill="url(#bg)"/>`;
    for (let i = 0; i < 18; i++) body += `<circle cx="${r() * 1200}" cy="${r() * 1500}" r="${30 + r() * 120}" fill="#e0b66a" opacity="${0.04 + r() * 0.1}" filter="url(#blur30)"/>`;
    const kind = e.pal;
    body += `<g filter="url(#drop)">${brilliant(600, 740, 560, kind, r, { rot: 11 })}</g>`;
    body += sparkle(430, 520, 220) + sparkle(760, 900, 140, 0.8) + sparkle(820, 480, 90, 0.7);
  } else if (e.scene === 'box') {
    body += backdrop('sand', r, 1250);
    body += `<path d="M180,1020 L1020,1020 L1060,1260 L140,1260Z" fill="#2a2018"/>`;
    body += `<path d="M180,1020 L1020,1020 L1000,1060 L200,1060Z" fill="#4a3a2a"/>`;
    body += `<path d="M180,1020 L260,520 L940,520 L1020,1020Z" fill="#1c1510"/>`;
    body += `<path d="M260,520 L940,520 L930,590 L270,590Z" fill="#3a2d21"/>`;
    body += `<rect x="260" y="1000" width="680" height="120" rx="30" fill="#7a5a3a"/><rect x="260" y="1000" width="680" height="30" rx="14" fill="#a08060"/>`;
    const rp = ringPiece({ style: 'solitaire', stoneKind: 'diamond' }, id, r);
    body += `<g transform="translate(300 270) scale(.5)" filter="url(#drop)">${rp.svg}</g>`;
  } else if (e.scene === 'arch') {
    body += `<rect width="1200" height="1500" fill="#d9c5a5"/>`;
    body += `<path d="M300,1300 L300,620 A300,300 0 0 1 900,620 L900,1300Z" fill="url(#bg)"/>`;
    body += `<path d="M300,1300 L300,620 A300,300 0 0 1 900,620 L900,1300Z" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="10"/>`;
    body += `<polygon points="360,360 640,360 1000,1500 380,1500" fill="#fff" opacity=".18" filter="url(#blur30)"/>`;
    body += `<rect x="0" y="1260" width="1200" height="240" fill="url(#floor)"/>`;
    body += `<rect x="470" y="1030" width="260" height="240" fill="#efe3d0"/><rect x="450" y="1010" width="300" height="34" fill="#fff7ea"/>`;
    const rp = ringPiece({ style: 'halo', stoneKind: 'diamond' }, id, r);
    body += `<g transform="translate(430 750) scale(.28)" filter="url(#drop)">${rp.svg}</g>`;
  } else if (e.scene === 'atelier') {
    body += backdrop('noir', r, 1180);
    body += `<rect x="0" y="1000" width="1200" height="500" fill="#3b2a1b"/><path d="M0,1000 L1200,1000" stroke="#8a6a44" stroke-width="3"/>`;
    for (let i = 0; i < 40; i++) body += `<path d="M0,${1010 + i * 12} L1200,${1010 + i * 12 + r() * 6}" stroke="rgba(0,0,0,.2)" stroke-width="2"/>`;
    body += `<polygon points="520,1000 700,1000 650,360 570,360" fill="url(#mg${id})"/><polygon points="570,360 650,360 640,330 580,330" fill="url(#mh${id})"/>`;
    body += `<path d="M ${520},1000 L700,1000" stroke="rgba(0,0,0,.4)" stroke-width="6"/>`;
    for (let k = 0; k < 4; k++) body += `<ellipse cx="610" cy="${780 + k * 0}" rx="${70 - k * 0}" ry="0" fill="none"/>`;
    body += `<ellipse cx="610" cy="760" rx="108" ry="30" fill="none" stroke="url(#mg${id})" stroke-width="26"/>`;
    body += `<circle cx="900" cy="1090" r="90" fill="rgba(255,255,255,.08)" stroke="url(#mg${id})" stroke-width="16"/><circle cx="900" cy="1090" r="74" fill="rgba(255,235,200,.12)"/>`;
    body += `<path d="M980,1130 L1160,1060" stroke="url(#mg${id})" stroke-width="12" stroke-linecap="round"/>`;
    body += `<path d="M180,1120 L400,1060 M200,1160 L430,1100" stroke="#9aa0a8" stroke-width="14" stroke-linecap="round"/>`;
  } else if (e.scene === 'trays') {
    body += `<rect width="1200" height="1500" fill="#120d0a"/>`;
    const kinds = ['diamond', 'diamond', 'emerald', 'ruby', 'sapphire', 'morganite'];
    for (let row = 0; row < 5; row++) {
      body += `<rect x="90" y="${130 + row * 270}" width="1020" height="230" rx="10" fill="#241a14" stroke="#4a3828" stroke-width="3"/>`;
      for (let c = 0; c < 8; c++) {
        const k = kinds[Math.floor(r() * kinds.length)];
        const rad = 28 + r() * 26;
        body += `<g filter="url(#drop)">${brilliant(170 + c * 124 + r() * 14, 245 + row * 270 + r() * 30 - 15, rad, k, r, { rot: r() * 40 })}</g>`;
      }
    }
  } else if (e.scene === 'gold') {
    body += backdrop('noir', r, 1240);
    for (let row = 0; row < 3; row++) for (let c = 0; c < 3 - row; c++) {
      const x = 260 + c * 330 + row * 165, y = 1100 - row * 150;
      body += `<g filter="url(#drop)"><path d="M${x},${y} L${x + 300},${y} L${x + 270},${y - 110} L${x + 30},${y - 110}Z" fill="url(#mg${id})"/><path d="M${x + 30},${y - 110} L${x + 270},${y - 110} L${x + 256},${y - 128} L${x + 44},${y - 128}Z" fill="url(#mh${id})"/></g>`;
    }
  } else if (e.scene === 'pearls') {
    body += backdrop('sand', r, 1200, { big: true });
    for (let i = 0; i < 26; i++) {
      const t = i / 25; const x = 90 + t * 1020; const y = 360 + Math.sin(t * Math.PI) * 720 - 40 * Math.sin(t * 9);
      body += `<circle cx="${x}" cy="${y}" r="52" fill="url(#pearl)" filter="url(#drop)"/><ellipse cx="${x - 16}" cy="${y - 18}" rx="14" ry="8" fill="#fff" opacity=".7"/>`;
    }
  } else if (e.scene === 'plinth') {
    body += backdrop('ivory', r, 1240);
    body += `<rect x="360" y="900" width="480" height="420" fill="#e6dac6"/><rect x="340" y="870" width="520" height="46" fill="#f7efe1"/><rect x="360" y="916" width="60" height="400" fill="#fff" opacity=".25"/>`;
    const rp = ringPiece({ style: 'pave', stoneKind: 'diamond' }, id, r);
    body += `<g transform="translate(405 395) scale(.33)" filter="url(#drop)">${rp.svg}</g>`;
  } else if (e.scene === 'vitrine') {
    body += `<rect width="1200" height="1500" fill="#0b0807"/>`;
    body += `<rect x="170" y="250" width="860" height="1000" fill="rgba(255,235,200,.05)" stroke="rgba(255,235,200,.4)" stroke-width="3"/>`;
    body += `<polygon points="420,250 780,250 1000,1250 200,1250" fill="#e8c27a" opacity=".12" filter="url(#blur30)"/>`;
    body += `<rect x="260" y="1000" width="680" height="250" fill="#1d150f"/><rect x="260" y="990" width="680" height="16" fill="#e8c27a" opacity=".5"/>`;
    const np = necklacePiece({ style: 'pendant', stoneKind: 'diamond' }, id, r);
    body += `<g transform="translate(270 270) scale(.55)">${np.svg}</g>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1500" width="1200" height="1500" preserveAspectRatio="xMidYMid slice">
  ${defs(bgKey, id, metal, r).replace('</defs>', `<filter id="drop" x="-10%" y="-10%" width="125%" height="125%"><feDropShadow dx="8" dy="14" stdDeviation="12" flood-color="#000" flood-opacity=".5"/></filter></defs>`)}
  ${body}
  <rect x="-2000" y="-2000" width="6000" height="6000" fill="url(#vig)"/>
  <rect x="-2000" y="-2000" width="6000" height="6000" filter="url(#grain)" opacity=".5"/>
  </svg>`;
}
