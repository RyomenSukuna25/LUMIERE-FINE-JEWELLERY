import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { productImg } from '../data/products';
import { inr, GST_RATE } from '../utils/format';
import { Summary } from './Cart';
import OrderConfirmation from '../components/OrderConfirmation';

const STEPS = ['Information', 'Delivery', 'Payment', 'Review', 'Confirmation'];
const DELIVERY = [
  { id: 'std', label: 'Insured standard delivery', note: '3 to 5 working days', days: 5, price: 0 },
  { id: 'exp', label: 'Express insured delivery', note: '1 to 2 working days', days: 2, price: 1200 },
  { id: 'show', label: 'Collect from the showroom', note: 'Ready in 24 hours, by appointment', days: 1, price: 0 },
];

function Stepper({ step }) {
  return (
    <ol className="stepper" aria-label="Checkout progress">
      {STEPS.map((s, i) => (
        <li key={s} className={i < step ? 'is-done' : i === step ? 'is-on' : ''} aria-current={i === step ? 'step' : undefined}>
          <span>{i < step ? <Check size={13} /> : i + 1}</span><b>{s}</b>
        </li>
      ))}
      <motion.i className="stepper__bar" animate={{ scaleX: step / (STEPS.length - 1) }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
    </ol>
  );
}

export default function Checkout() {
  const { lines, subtotal, discount, gst, total, promo, clearCart } = useStore();
  const { session } = useAuth();
  const [step, setStep] = useState(0); const [dir, setDir] = useState(1);
  const [info, setInfo] = useState({ name: session?.name || '', email: session?.email || '', phone: '', line: '', city: '', state: '', pin: '' });
  const [errs, setErrs] = useState({});
  const [del, setDel] = useState('std');
  const [pay, setPay] = useState({ method: 'card', card: '', exp: '', cvv: '', upi: '' });
  const [placing, setPlacing] = useState(false);
  const [order, setOrder] = useState(null);
  const d = DELIVERY.find((x) => x.id === del);
  const grand = total + d.price;
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [step]);

  const go = (n) => { setDir(n > step ? 1 : -1); setStep(n); };
  const validate = () => {
    const e = {};
    if (step === 0) {
      if (!info.name.trim()) e.name = 'Enter your full name.';
      if (!/^\S+@\S+\.\S+$/.test(info.email)) e.email = 'Enter a valid email.';
      if (!/^[+\d][\d\s-]{8,}$/.test(info.phone)) e.phone = 'Enter a valid phone number.';
      if (del !== 'show' || true) { if (!info.line.trim()) e.line = 'Enter your address.'; if (!info.city.trim()) e.city = 'Enter your city.'; if (!info.state.trim()) e.state = 'Enter your state.'; if (!/^\d{6}$/.test(info.pin)) e.pin = 'Enter a 6-digit PIN code.'; }
    }
    if (step === 2) {
      if (pay.method === 'card') { if (pay.card.replace(/\s/g, '').length < 12) e.card = 'Enter a card number (any test number works).'; if (!/^\d{2}\/\d{2}$/.test(pay.exp)) e.exp = 'Use MM/YY.'; if (!/^\d{3,4}$/.test(pay.cvv)) e.cvv = 'Enter the CVV.'; }
      if (pay.method === 'upi' && !/^[\w.-]+@[\w]+$/.test(pay.upi)) e.upi = 'Enter a UPI ID like name@bank.';
    }
    setErrs(e); return Object.keys(e).length === 0;
  };
  const next = () => { if (validate()) go(step + 1); };
  const place = async () => {
    setPlacing(true);
    const o = await api.orders.create({
      customerName: info.name, email: (session?.email || info.email).toLowerCase(), phone: info.phone, address: { line: info.line, city: info.city, state: info.state, pin: info.pin },
      items: lines.map((l) => ({ id: l.id, name: l.product.name, price: l.product.price, qty: l.qty, size: l.size })),
      subtotal, discount, gst, shipping: d.price, total: grand, delivery: { id: d.id, label: d.label, days: d.days }, payment: { method: pay.method, simulated: true },
    });
    clearCart(); setOrder(o); setPlacing(false); go(4);
  };
  const field = (k, label, props = {}) => (
    <div className="field"><label htmlFor={`f-${k}`}>{label}</label><input id={`f-${k}`} value={info[k]} aria-invalid={!!errs[k]} aria-describedby={errs[k] ? `e-${k}` : undefined} onChange={(e) => setInfo({ ...info, [k]: e.target.value })} {...props} />{errs[k] && <p id={`e-${k}`} className="form-err" role="alert">{errs[k]}</p>}</div>
  );

  if (!lines.length && !order) return <div className="nf nf--inline"><p className="serif">Your bag is empty.</p><Link to="/shop" className="btn btn--dark">Browse jewellery</Link></div>;
  if (step === 4 && order) return <div className="co co--done"><Stepper step={4} /><OrderConfirmation order={order} /></div>;
  const variants = { enter: (s) => ({ opacity: 0, x: 50 * s }), center: { opacity: 1, x: 0 }, exit: (s) => ({ opacity: 0, x: -50 * s }) };
  return (
    <div className="co">
      <Stepper step={step} />
      <div className="co__grid">
        <div className="co__main">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.section key={step} custom={dir} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} aria-label={STEPS[step]}>
              {step === 0 && (
                <>
                  <h1 className="serif">Your details</h1>
                  {!session && <p className="fine">Have an account? <Link to="/signin" className="u">Sign in</Link> to fill this in faster.</p>}
                  <div className="co__f2">{field('name', 'Full name', { autoComplete: 'name' })}{field('phone', 'Phone number', { autoComplete: 'tel', inputMode: 'tel' })}</div>
                  {field('email', 'Email', { type: 'email', autoComplete: 'email' })}
                  {field('line', 'Address', { autoComplete: 'street-address' })}
                  <div className="co__f3">{field('city', 'City', { autoComplete: 'address-level2' })}{field('state', 'State', { autoComplete: 'address-level1' })}{field('pin', 'PIN code', { inputMode: 'numeric', maxLength: 6, autoComplete: 'postal-code' })}</div>
                </>
              )}
              {step === 1 && (
                <>
                  <h1 className="serif">Delivery</h1>
                  <div className="opts" role="radiogroup" aria-label="Delivery method">
                    {DELIVERY.map((o) => <label key={o.id} className={`opt ${del === o.id ? 'is-on' : ''}`}><input type="radio" name="del" checked={del === o.id} onChange={() => setDel(o.id)} /><span><b>{o.label}</b><em>{o.note}</em></span><strong>{o.price ? inr(o.price) : 'Free'}</strong></label>)}
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <h1 className="serif">Payment</h1>
                  <p className="co__note"><Lock size={15} /> Prototype checkout. Payment is simulated and no card or UPI details are sent or stored.</p>
                  <div className="opts" role="radiogroup" aria-label="Payment method">
                    {[['card', 'Credit or debit card'], ['upi', 'UPI'], ['netbanking', 'Net banking']].map(([id, l]) => <label key={id} className={`opt ${pay.method === id ? 'is-on' : ''}`}><input type="radio" name="pay" checked={pay.method === id} onChange={() => setPay({ ...pay, method: id })} /><span><b>{l}</b></span></label>)}
                  </div>
                  {pay.method === 'card' && <div className="co__pay">
                    <div className="field"><label htmlFor="cc">Card number</label><input id="cc" inputMode="numeric" autoComplete="off" placeholder="4242 4242 4242 4242" value={pay.card} onChange={(e) => setPay({ ...pay, card: e.target.value.replace(/[^\d ]/g, '').slice(0, 19) })} aria-invalid={!!errs.card} />{errs.card && <p className="form-err" role="alert">{errs.card}</p>}</div>
                    <div className="co__f2"><div className="field"><label htmlFor="ex">Expiry</label><input id="ex" placeholder="MM/YY" value={pay.exp} onChange={(e) => setPay({ ...pay, exp: e.target.value })} aria-invalid={!!errs.exp} />{errs.exp && <p className="form-err" role="alert">{errs.exp}</p>}</div><div className="field"><label htmlFor="cv">CVV</label><input id="cv" inputMode="numeric" maxLength={4} value={pay.cvv} onChange={(e) => setPay({ ...pay, cvv: e.target.value })} aria-invalid={!!errs.cvv} />{errs.cvv && <p className="form-err" role="alert">{errs.cvv}</p>}</div></div>
                  </div>}
                  {pay.method === 'upi' && <div className="field"><label htmlFor="upi">UPI ID</label><input id="upi" placeholder="name@bank" value={pay.upi} onChange={(e) => setPay({ ...pay, upi: e.target.value })} aria-invalid={!!errs.upi} />{errs.upi && <p className="form-err" role="alert">{errs.upi}</p>}</div>}
                </>
              )}
              {step === 3 && (
                <>
                  <h1 className="serif">Review your order</h1>
                  <div className="rv"><div><span className="meta">Contact</span><p>{info.name}<br />{info.email} · {info.phone}</p><button className="u" onClick={() => go(0)}>Edit</button></div>
                    <div><span className="meta">Ship to</span><p>{info.line}, {info.city}, {info.state} {info.pin}</p><button className="u" onClick={() => go(0)}>Edit</button></div>
                    <div><span className="meta">Delivery</span><p>{d.label}, {d.note}</p><button className="u" onClick={() => go(1)}>Edit</button></div>
                    <div><span className="meta">Payment</span><p>{pay.method === 'card' ? `Card ending ${pay.card.replace(/\s/g, '').slice(-4)}` : pay.method === 'upi' ? pay.upi : 'Net banking'} (simulated)</p><button className="u" onClick={() => go(2)}>Edit</button></div></div>
                </>
              )}
            </motion.section>
          </AnimatePresence>
          <div className="co__nav">
            {step > 0 ? <button className="btn btn--line" onClick={() => go(step - 1)}>Back</button> : <Link to="/cart" className="btn btn--line">Back to bag</Link>}
            {step < 3 ? <button className="btn btn--dark" onClick={next}>Continue</button> : <button className="btn btn--dark" disabled={placing} onClick={place}>{placing ? 'Placing order…' : `Place order · ${inr(grand)}`}</button>}
          </div>
        </div>
        <aside className="co__side" aria-label="Order summary">
          <ul className="co__items">{lines.map((l) => <li key={l.key}><span className="co__thumb"><img src={productImg(l.product, 0, 480)} alt="" /><i>{l.qty}</i></span><span><b>{l.product.name}</b><em>{l.size !== 'One size' ? `Size ${l.size}` : l.product.material}</em></span><strong>{inr(l.product.price * l.qty)}</strong></li>)}</ul>
          <div className="sum"><dl>
            <div className="row"><dt>Subtotal</dt><dd>{inr(subtotal)}</dd></div>
            {discount > 0 && <div className="row"><dt>Discount ({promo?.code})</dt><dd>− {inr(discount)}</dd></div>}
            <div className="row"><dt>Shipping</dt><dd>{d.price ? inr(d.price) : 'Free'}</dd></div>
            <div className="row"><dt>GST ({GST_RATE * 100}%)</dt><dd>{inr(gst)}</dd></div>
            <div className="row sum__total"><dt>Total</dt><dd>{inr(grand)}</dd></div>
          </dl></div>
        </aside>
      </div>
    </div>
  );
}
