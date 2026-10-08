import catalog from './catalog.json';
import { load, save } from '../utils/storage';

export const PRODUCTS = catalog.products;
export const EDITORIAL = catalog.editorial;

export const productImg = (p, i = 0, w = 800) => `/images/products/${p.views[i % p.views.length].file}-${w}.jpg`;
export const productSrcSet = (p, i = 0) => [480, 800, 1200].map((w) => `${productImg(p, i, w)} ${w}w`).join(', ');
export const edImg = (id, w = 800) => `/images/editorial/ed-${id}-${w}.jpg`;
export const edSrcSet = (id) => [480, 800, 1200].map((w) => `${edImg(id, w)} ${w}w`).join(', ');
export const edAlt = (id) => EDITORIAL.find((e) => e.id === id)?.alt || '';

PRODUCTS.forEach((p) => {
  p.images = p.views.map((v, i) => ({
    src: productImg(p, i, 800), srcSet: productSrcSet(p, i), full: productImg(p, i, 1200),
    thumb: productImg(p, i, 480), alt: `${p.name} in ${p.material.toLowerCase()}, ${v.label.toLowerCase()}`,
  }));
});

// Dashboard edits (price, stock, visibility) are persisted locally in the prototype and applied in place.
const OVERRIDES_KEY = 'lm_catalog_overrides';
export function applyOverrides() {
  const o = load(OVERRIDES_KEY, {});
  PRODUCTS.forEach((p) => { if (o[p.id]) Object.assign(p, o[p.id]); });
}
export function patchProduct(id, patch) {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) return null;
  Object.assign(p, patch);
  if (patch.stock !== undefined) p.availability = patch.stock === 0 ? 'out-of-stock' : patch.stock <= 3 ? 'low-stock' : 'in-stock';
  const o = load(OVERRIDES_KEY, {});
  o[id] = { ...(o[id] || {}), ...patch, availability: p.availability };
  save(OVERRIDES_KEY, o);
  return p;
}
applyOverrides();

export const byId = (id) => PRODUCTS.find((p) => p.id === id || p.slug === id);
export const MATERIALS = [{ id: 'rose', label: 'Rose gold' }, { id: 'yellow', label: 'Yellow gold' }, { id: 'white', label: 'White gold' }];
export const CATEGORIES = ['Rings', 'Necklaces', 'Pendants', 'Earrings', 'Bracelets', 'Sets'];
export const STONES = ['Diamonds', 'Emerald', 'Ruby', 'Blue Sapphire', 'Morganite', 'Cultured Pearl', 'Polished gold'];
export const PRICE_BANDS = [
  { id: 'u30', label: 'Under ₹30,000', min: 0, max: 30000 },
  { id: '30-60', label: '₹30,000 – ₹60,000', min: 30000, max: 60000 },
  { id: '60-100', label: '₹60,000 – ₹1,00,000', min: 60000, max: 100000 },
  { id: '100+', label: 'Above ₹1,00,000', min: 100000, max: Infinity },
];
