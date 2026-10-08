import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useScrollLock } from '../hooks/useLenis';
import { productImg } from '../data/products';
import { inr } from '../utils/format';
import AnimatedNumber from './AnimatedNumber';

export default function CartDrawer() {
  const { ui, open, lines, count, subtotal, setQty, removeLine } = useStore();
  const nav = useNavigate();
  const close = () => open('cartOpen', false);
  useScrollLock(ui.cartOpen);
  useEffect(() => {
    if (!ui.cartOpen) return undefined;
    const k = (e) => e.key === 'Escape' && close();
    document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k);
  }, [ui.cartOpen]);
  const go = (to) => { close(); nav(to); };
  return (
    <AnimatePresence>
      {ui.cartOpen && (
        <div className="drawer-root" role="dialog" aria-modal="true" aria-label="Your bag">
          <motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} onClick={close} />
          <motion.aside className="drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
            <header className="drawer__hd"><h2>Your bag <span>({count})</span></h2><button className="icon-btn" aria-label="Close bag" onClick={close}><X size={22} strokeWidth={1.3} /></button></header>
            <div className="drawer__body" data-lenis-prevent>
              {lines.length === 0 ? (
                <div className="drawer__empty"><p className="serif">Your bag is empty.</p><p>Start with something you would wear every day.</p><button className="btn btn--dark" onClick={() => go('/shop')}>Browse jewellery</button></div>
              ) : (
                <ul>
                  <AnimatePresence initial={false}>
                    {lines.map((l) => (
                      <motion.li key={l.key} layout initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="line">
                        <Link to={`/product/${l.product.slug}`} onClick={close}><img src={productImg(l.product, 0, 480)} alt={l.product.images[0].alt} /></Link>
                        <div className="line__info">
                          <Link to={`/product/${l.product.slug}`} onClick={close}><b>{l.product.name}</b></Link>
                          <span>{l.product.material}{l.size && l.size !== 'One size' ? ` · Size ${l.size}` : ''}</span>
                          <div className="qty" role="group" aria-label={`Quantity for ${l.product.name}`}>
                            <button aria-label="Decrease quantity" onClick={() => setQty(l.key, l.qty - 1)}><Minus size={14} /></button>
                            <motion.output key={l.qty} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>{l.qty}</motion.output>
                            <button aria-label="Increase quantity" onClick={() => setQty(l.key, l.qty + 1)}><Plus size={14} /></button>
                          </div>
                        </div>
                        <div className="line__end"><strong>{inr(l.product.price * l.qty)}</strong><button className="icon-btn" aria-label={`Remove ${l.product.name}`} onClick={() => removeLine(l.key)}><Trash2 size={16} strokeWidth={1.4} /></button></div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>
            {lines.length > 0 && (
              <footer className="drawer__ft">
                <div className="row"><span>Subtotal</span><strong><AnimatedNumber value={subtotal} /></strong></div>
                <p className="fine">Shipping is complimentary. GST is added at checkout.</p>
                <button className="btn btn--dark btn--block" onClick={() => go('/checkout')}>Checkout</button>
                <div className="drawer__ft-2"><button className="btn btn--line" onClick={() => go('/cart')}>View bag</button><button className="btn btn--line" onClick={close}>Continue shopping</button></div>
              </footer>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
