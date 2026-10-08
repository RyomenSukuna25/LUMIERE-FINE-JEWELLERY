import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import useAddToBag from '../hooks/useAddToBag';
import { useScrollLock } from '../hooks/useLenis';
import Img from './Img';
import { inr } from '../utils/format';

export default function QuickView() {
  const { ui, open } = useStore();
  const p = ui.quick;
  const add = useAddToBag();
  const [size, setSize] = useState(null);
  const img = useRef(null);
  const close = () => open('quick', null);
  useScrollLock(!!p);
  useEffect(() => { setSize(p?.sizes[0] ?? null); }, [p]);
  useEffect(() => {
    if (!p) return undefined;
    const k = (e) => e.key === 'Escape' && close();
    document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k);
  }, [p]);
  return (
    <AnimatePresence>
      {p && (
        <div className="modal-root" role="dialog" aria-modal="true" aria-label={`Quick view: ${p.name}`}>
          <motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} />
          <motion.div className="qv" initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
            <button className="icon-btn qv__x" aria-label="Close quick view" onClick={close}><X size={22} strokeWidth={1.3} /></button>
            <div className="qv__media"><Img src={p.images[0].src} srcSet={p.images[0].srcSet} sizes="(min-width: 768px) 40vw, 90vw" alt={p.images[0].alt} eager /></div>
            <div className="qv__info" data-lenis-prevent>
              <p className="meta">{p.category}</p>
              <h2 className="serif">{p.name}</h2>
              <p className="qv__price">{inr(p.price)}{p.compareAtPrice && <s>{inr(p.compareAtPrice)}</s>}</p>
              <p>{p.description}</p>
              <dl className="specs"><div><dt>Material</dt><dd>{p.material}</dd></div><div><dt>Stone</dt><dd>{p.stone}</dd></div></dl>
              {p.sizes.length > 1 && (
                <fieldset className="sizes"><legend>Size</legend>
                  {p.sizes.map((s) => <label key={s} className={size === s ? 'is-on' : ''}><input type="radio" name="qv-size" checked={size === s} onChange={() => setSize(s)} />{s}</label>)}
                </fieldset>
              )}
              <div className="qv__cta">
                <button className="btn btn--dark" disabled={p.availability === 'out-of-stock'} onClick={async (e) => { await add(p, { size, imgEl: e.currentTarget.closest('.qv').querySelector('.qv__media img'), openDrawer: false }); close(); setTimeout(() => open('cartOpen', true), 150); }}>Add to bag</button>
                <Link className="btn btn--line" to={`/product/${p.slug}`} onClick={close}>Full details</Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
