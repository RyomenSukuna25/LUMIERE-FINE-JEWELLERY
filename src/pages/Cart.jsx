import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { promoLookup } from '../api';
import { productImg } from '../data/products';
import { inr } from '../utils/format';
import AnimatedNumber from '../components/AnimatedNumber';

export function Summary({ showCode = true }) {
  const { subtotal, discount, gst, total, promo, setPromo } = useStore();
  const [code, setCode] = useState(''); const [msg, setMsg] = useState('');
  const apply = (e) => { e.preventDefault(); const p = promoLookup(code); if (p) { setPromo(p); setMsg(`${p.code} applied`); } else { setPromo(null); setMsg('That code is not valid.'); } };
  return (
    <div className="sum">
      <h2 className="serif">Order summary</h2>
      {showCode && (
        <form className="sum__code" onSubmit={apply}>
          <label className="sr-only" htmlFor="promo">Promo code</label>
          <input id="promo" placeholder="Promo code (try WELCOME10)" value={code} onChange={(e) => setCode(e.target.value)} /><button className="btn btn--line">Apply</button>
          {msg && <p className={promo ? 'fine' : 'form-err'} role="status">{msg}</p>}
        </form>
      )}
      <dl>
        <div className="row"><dt>Subtotal</dt><dd>{inr(subtotal)}</dd></div>
        {discount > 0 && <div className="row"><dt>Discount</dt><dd>− {inr(discount)}</dd></div>}
        <div className="row"><dt>Shipping</dt><dd>Free</dd></div>
        <div className="row"><dt>GST (3%)</dt><dd>{inr(gst)}</dd></div>
        <div className="row sum__total"><dt>Total</dt><dd><AnimatedNumber value={total} /></dd></div>
      </dl>
    </div>
  );
}

export default function Cart() {
  const { lines, setQty, removeLine } = useStore();
  return (
    <>
      <div className="pg-head"><div><h1 className="serif">Your bag</h1><p>{lines.length ? 'Review your pieces before checkout.' : 'Nothing here yet.'}</p></div></div>
      {lines.length === 0 ? (
        <div className="nf nf--inline"><p className="serif">Your bag is empty.</p><Link to="/shop" className="btn btn--dark">Continue shopping</Link></div>
      ) : (
        <div className="cartp">
          <ul>
            <AnimatePresence initial={false}>
              {lines.map((l) => (
                <motion.li key={l.key} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -40, height: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="cartp__line">
                  <Link to={`/product/${l.product.slug}`}><img src={productImg(l.product, 0, 480)} alt={l.product.images[0].alt} /></Link>
                  <div className="cartp__info"><Link to={`/product/${l.product.slug}`} className="serif">{l.product.name}</Link><span>{l.product.material}{l.size && l.size !== 'One size' ? ` · Size ${l.size}` : ''}</span>
                    <div className="qty"><button aria-label="Decrease quantity" onClick={() => setQty(l.key, l.qty - 1)}><Minus size={14} /></button><output>{l.qty}</output><button aria-label="Increase quantity" onClick={() => setQty(l.key, l.qty + 1)}><Plus size={14} /></button></div>
                  </div>
                  <strong>{inr(l.product.price * l.qty)}</strong>
                  <button className="icon-btn" aria-label={`Remove ${l.product.name}`} onClick={() => removeLine(l.key)}><Trash2 size={18} strokeWidth={1.3} /></button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <aside><Summary /><Link to="/checkout" className="btn btn--dark btn--block">Proceed to checkout</Link><Link to="/shop" className="btn btn--line btn--block">Continue shopping</Link></aside>
        </div>
      )}
    </>
  );
}
