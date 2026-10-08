import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import ProductGrid from '../components/ProductGrid';
import FilterPanel from '../components/FilterPanel';
import FilterDrawer from '../components/FilterDrawer';
import { PRODUCTS, PRICE_BANDS } from '../data/products';
import { COLLECTIONS } from '../data/collections';
import { searchProducts } from '../components/SearchOverlay';

const SORTS = [['featured', 'Featured'], ['new', 'Newest'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low'], ['rating', 'Top rated']];
const KEYS = ['q', 'category', 'collection', 'material', 'stone', 'price', 'sort'];

export default function Shop() {
  const [sp, setSp] = useSearchParams();
  const [drawer, setDrawer] = useState(false);
  const f = Object.fromEntries(KEYS.map((k) => [k, sp.get(k) || '']));
  const set = (patch) => { const n = new URLSearchParams(sp); Object.entries(patch).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k))); setSp(n, { replace: true }); };
  const clear = () => setSp({}, { replace: true });

  const list = useMemo(() => {
    let r = f.q ? searchProducts(f.q) : [...PRODUCTS];
    if (f.category) r = r.filter((p) => p.category === f.category);
    if (f.collection) r = r.filter((p) => p.collections.includes(f.collection));
    if (f.material) r = r.filter((p) => p.metal === f.material);
    if (f.stone) r = r.filter((p) => p.stone === f.stone);
    if (f.price) { const b = PRICE_BANDS.find((x) => x.id === f.price); if (b) r = r.filter((p) => p.price >= b.min && p.price < b.max); }
    const s = f.sort || 'featured';
    if (s === 'price-asc') r.sort((a, b) => a.price - b.price);
    else if (s === 'price-desc') r.sort((a, b) => b.price - a.price);
    else if (s === 'rating') r.sort((a, b) => b.rating - a.rating);
    else if (s === 'new') r.sort((a, b) => Number(b.newArrival) - Number(a.newArrival));
    else if (!f.q) r.sort((a, b) => Number(b.featured) - Number(a.featured) || Number(b.bestseller) - Number(a.bestseller));
    return r;
  }, [f.q, f.category, f.collection, f.material, f.stone, f.price, f.sort]);

  const active = ['category', 'collection', 'material', 'stone', 'price'].filter((k) => f[k]);
  const col = COLLECTIONS.find((c) => c.id === f.collection);
  const label = (k) => (k === 'collection' ? col?.name : k === 'price' ? PRICE_BANDS.find((b) => b.id === f.price)?.label : k === 'material' ? { rose: 'Rose gold', yellow: 'Yellow gold', white: 'White gold' }[f.material] : f[k]);
  return (
    <>
      <div className="pg-head">
        <div>
          <nav className="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <span>Jewellery</span>{col && <> / <span>{col.name}</span></>}</nav>
          <h1 className="serif">{col ? col.name : f.q ? `Results for “${f.q}”` : 'Jewellery'}</h1>
          <p>{col ? col.blurb : 'Rings, necklaces, earrings and bracelets in rose, yellow and white gold.'}</p>
        </div>
      </div>
      <div className="shop">
        <aside className="shop__side" aria-label="Filters"><FilterPanel f={f} set={set} clear={clear} /></aside>
        <section aria-label="Products">
          <div className="shop__bar">
            <button className="btn btn--line shop__fbtn" onClick={() => setDrawer(true)}><SlidersHorizontal size={16} />Filters{active.length ? ` (${active.length})` : ''}</button>
            <label className="shop__search"><Search size={16} aria-hidden="true" /><span className="sr-only">Search within results</span><input type="search" placeholder="Search jewellery" value={f.q} onChange={(e) => set({ q: e.target.value })} /></label>
            <p className="shop__count" aria-live="polite">{list.length} {list.length === 1 ? 'piece' : 'pieces'}</p>
            <label className="shop__sort"><span className="sr-only">Sort by</span>
              <select value={f.sort || 'featured'} onChange={(e) => set({ sort: e.target.value === 'featured' ? '' : e.target.value })}>{SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            </label>
          </div>
          {active.length > 0 && (
            <div className="shop__active">
              <AnimatePresence initial={false}>{active.map((k) => (
                <motion.button key={k} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="chip is-on" onClick={() => set({ [k]: '' })} aria-label={`Remove filter ${label(k)}`}>{label(k)}<X size={13} /></motion.button>
              ))}</AnimatePresence>
            </div>
          )}
          {list.length ? <ProductGrid products={list} columns="grid-3" /> : (
            <div className="shop__empty"><p className="serif">Nothing matches those filters.</p><button className="btn btn--dark" onClick={clear}>Clear filters</button></div>
          )}
        </section>
      </div>
      <FilterDrawer open={drawer} onClose={() => setDrawer(false)} f={f} set={set} clear={clear} count={list.length} />
    </>
  );
}
