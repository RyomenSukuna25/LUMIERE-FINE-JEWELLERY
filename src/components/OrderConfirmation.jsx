import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { productImg, byId } from '../data/products';
import { inr, dateFmt } from '../utils/format';

const STEPS = ['Order confirmed', 'Processing', 'Shipped', 'Out for delivery', 'Delivered'];
const IDX = { Processing: 1, Packed: 1, Shipped: 2, Delivered: 4, Cancelled: 0 };

export default function OrderConfirmation({ order }) {
  const at = IDX[order.status] ?? 1;
  const eta = new Date(new Date(order.placed).getTime() + (order.delivery?.days || 5) * 86400000);
  return (
    <div className="oc">
      <motion.div className="oc__tick" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
        <svg viewBox="0 0 100 100" width="96" height="96" aria-hidden="true"><motion.circle cx="50" cy="50" r="46" fill="none" stroke="#D4B895" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1 }} /><motion.path d="M30 52l14 14 27-30" fill="none" stroke="#D4B895" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.7, duration: 0.6 }} /></svg>
      </motion.div>
      <motion.h1 className="serif" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }}>Your piece is on its way.</motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>Thank you for choosing LUMIÈRE. Your order <b>{order.number}</b> has been placed. This is a prototype: no payment was taken.</motion.p>
      <ol className="oc__track" aria-label="Order progress">
        {STEPS.map((s, i) => <li key={s} className={i <= at ? 'is-done' : ''}><span>{i <= at ? <Check size={13} /> : null}</span>{s}</li>)}
      </ol>
      <div className="oc__grid">
        <div className="oc__items">
          <h2 className="meta">Your order</h2>
          {order.items.map((it, i) => { const p = byId(it.id); return (
            <div className="oc__item" key={i}>{p && <img src={productImg(p, 0, 480)} alt="" />}<div><b>{it.name}</b><span>{it.size && it.size !== 'One size' ? `Size ${it.size} · ` : ''}Qty {it.qty}</span></div><strong>{inr(it.price * it.qty)}</strong></div>
          ); })}
          <div className="row oc__tot"><span>Total paid (simulated)</span><strong>{inr(order.total)}</strong></div>
        </div>
        <div className="oc__info">
          <h2 className="meta">Delivery</h2>
          <p>{order.customerName}<br />{order.address?.line}<br />{order.address?.city}, {order.address?.state} {order.address?.pin}</p>
          <p className="fine">{order.delivery?.label || 'Standard delivery'}. Estimated arrival by {dateFmt(eta, { day: 'numeric', month: 'long' })}.</p>
          <p className="fine">Placed on {dateFmt(order.placed, { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
        </div>
      </div>
      <div className="oc__cta"><Link className="btn btn--dark" to="/shop">Continue shopping</Link><Link className="btn btn--line" to="/account/orders">View order</Link></div>
    </div>
  );
}
