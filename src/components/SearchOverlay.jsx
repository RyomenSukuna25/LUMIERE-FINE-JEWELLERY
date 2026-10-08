import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X, ArrowUpRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useScrollLock } from '../hooks/useLenis';
import { PRODUCTS, productImg } from '../data/products';
import { COLLECTIONS } from '../data/collections';
import { inr } from '../utils/format';

export const searchProducts = (q) => {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return PRODUCTS.map((p) => {
    const hay = `${p.name} ${p.category} ${p.collections.join(' ')} ${p.material} ${p.stone} ${p.description}`.toLowerCase();
    let score = 0;
    for (const t of terms) { if (!hay.includes(t)) return null; score += p.name.toLowerCase().includes(t) ? 3 : p.category.toLowerCase().includes(t) ? 2 : 1; }
    return { p, score };
  }).filter(Boolean).sort((a, b) => b.score - a.score).map((x) => x.p);
};
const POPULAR = ['Diamond ring', 'Emerald', 'Bridal', 'Gold bangle', 'Pearl', 'Studs'];

export default function SearchOverlay() {
  const { ui, open } = useStore();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const input = useRef(null);
  const close = () => { open('searchOpen', false); setQ(''); };
  useScrollLock(ui.searchOpen);
  useEffect(() => { if (ui.searchOpen) setTimeout(() => input.current?.focus(), 250); }, [ui.searchOpen]);
  useEffect(() => {
    if (!ui.searchOpen) return undefined;
    const k = (e) => e.key === 'Escape' && close();
    document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k);
  }, [ui.searchOpen]);
  const results = useMemo(() => searchProducts(q).slice(0, 8), [q]);
  const cols = useMemo(() => (q ? COLLECTIONS.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())) : []), [q]);
  const go = (e) => { e.preventDefault(); if (!q.trim()) return; nav(`/shop?q=${encodeURIComponent(q.trim())}`); close(); };
  return (
    <AnimatePresence>
      {ui.searchOpen && (
        <motion.div className="search" role="dialog" aria-modal="true" aria-label="Search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <div className="search__dim" onClick={close} />
          <motion.div className="search__panel" initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} exit={{ clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}>
            <form className="search__bar" onSubmit={go} role="search">
              <Search size={22} strokeWidth={1.3} aria-hidden="true" />
              <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search rings, emerald, bridal…" aria-label="Search the collection" autoComplete="off" />
              <button type="button" className="icon-btn" aria-label="Close search" onClick={close}><X size={22} strokeWidth={1.3} /></button>
            </form>
            <div className="search__body">
              {!q && (
                <div className="search__suggest">
                  <p className="meta">Popular searches</p>
                  <div className="chips">{POPULAR.map((s) => <button key={s} className="chip" onClick={() => setQ(s)}>{s}</button>)}</div>
                  <p className="meta">Collections</p>
                  <div className="chips">{COLLECTIONS.map((c) => <Link key={c.id} className="chip" to={`/shop?collection=${c.id}`} onClick={close}>{c.name}</Link>)}</div>
                </div>
              )}
              {q && (
                <>
                  <p className="meta" aria-live="polite">{results.length ? `${results.length} ${results.length === 1 ? 'piece' : 'pieces'} for “${q}”` : `No pieces match “${q}”. Try “ring”, “emerald” or “bridal”.`}</p>
                  {cols.length > 0 && <div className="chips">{cols.map((c) => <Link key={c.id} className="chip" to={`/shop?collection=${c.id}`} onClick={close}>{c.name} collection<ArrowUpRight size={14} /></Link>)}</div>}
                  <ul className="search__results">
                    <AnimatePresence initial={false}>
                      {results.map((p, i) => (
                        <motion.li key={p.id} layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03, duration: 0.35 }}>
                          <Link to={`/product/${p.slug}`} onClick={close}>
                            <img src={productImg(p, 0, 480)} alt="" loading="lazy" />
                            <span><b>{p.name}</b><em>{p.category} · {p.material}</em></span>
                            <strong>{inr(p.price)}</strong>
                          </Link>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                  {results.length > 0 && <button className="btn btn--line" onClick={go}>See all results</button>}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
