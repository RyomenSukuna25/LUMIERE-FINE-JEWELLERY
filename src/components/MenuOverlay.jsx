import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import Logo from './Logo';
import Img from './Img';
import { useStore } from '../context/StoreContext';
import { useScrollLock } from '../hooks/useLenis';
import { COLLECTIONS } from '../data/collections';

const LINKS = [['/', 'Home'], ['/collections', 'Collections'], ['/shop', 'Jewellery'], ['/about', 'About'], ['/journal', 'Journal'], ['/contact', 'Contact']];

export default function MenuOverlay() {
  const { ui, open } = useStore();
  const { pathname } = useLocation();
  const close = () => open('menuOpen', false);
  useScrollLock(ui.menuOpen);
  useEffect(() => { open('menuOpen', false); }, [pathname, open]);
  useEffect(() => {
    if (!ui.menuOpen) return undefined;
    const k = (e) => e.key === 'Escape' && close();
    document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k);
  }, [ui.menuOpen]);
  const feature = COLLECTIONS[0];
  return (
    <AnimatePresence>
      {ui.menuOpen && (
        <motion.div className="menu" role="dialog" aria-modal="true" aria-label="Menu" initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} exit={{ clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}>
          <div className="menu__bar"><Logo /><button className="icon-btn" aria-label="Close menu" onClick={close}><X size={24} strokeWidth={1.3} /></button></div>
          <div className="menu__grid">
            <ul className="menu__list">
              {LINKS.map(([to, label], i) => (
                <motion.li key={to} initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
                  <Link to={to}>{label}</Link>
                  {label === 'Collections' && (
                    <ul className="menu__sub">{COLLECTIONS.slice(0, 5).map((c) => <li key={c.id}><Link to={`/shop?collection=${c.id}`}>{c.name}</Link></li>)}</ul>
                  )}
                </motion.li>
              ))}
            </ul>
            <motion.figure className="menu__feature" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45, duration: 0.8 }}>
              <Img src={feature.coverSm} alt={feature.coverAlt} eager />
              <figcaption><span>A story</span><span>in every piece.</span></figcaption>
            </motion.figure>
          </div>
          <p className="menu__foot">Jewellery for life’s brightest moments</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
