import fs from 'node:fs';
import { products, editorial } from './catalog.mjs';
import { renderProduct, renderEditorial } from './art.mjs';
const out = '/tmp/lm-svg'; fs.mkdirSync(out, { recursive: true });
const only = process.argv[2];
let n = 0;
for (const p of products) {
  if (only && !p.slug.includes(only)) continue;
  p.views.forEach((v, i) => { fs.writeFileSync(`${out}/${v.file}.svg`, renderProduct(p, i)); n++; });
}
for (const e of editorial) { if (only && !e.id.includes(only)) continue; fs.writeFileSync(`${out}/ed-${e.id}.svg`, renderEditorial(e)); n++; }
console.log('svgs', n);
