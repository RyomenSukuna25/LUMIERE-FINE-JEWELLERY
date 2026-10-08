import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Minus, Plus, Star, Truck, RotateCcw, ShieldCheck, Gift, ChevronDown } from 'lucide-react';
import ProductGallery from '../components/ProductGallery';
import ProductCard from '../components/ProductCard';
import NotFound from './NotFound';
import { byId, PRODUCTS } from '../data/products';
import { useStore } from '../context/StoreContext';
import useAddToBag from '../hooks/useAddToBag';
import { inr, pct } from '../utils/format';

function Acc({ title, children, open: o = false }) {
  const [open, setOpen] = useState(o);
  return (
    <div className="acc">
      <button aria-expanded={open} onClick={() => setOpen(!open)}><span>{title}</span><ChevronDown size={18} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .4s' }} /></button>
      <AnimatePresence initial={false}>{open && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} style={{ overflow: 'hidden' }}><div className="acc__in">{children}</div></motion.div>}</AnimatePresence>
    </div>
  );
}

export default function Product() {
  const { id } = useParams();
  const p = byId(id);
  const { wishlist, toggleWish } = useStore();
  const add = useAddToBag();
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [pressed, setPressed] = useState(false);
  const root = useRef(null);
  useEffect(() => { setSize(p?.sizes[0] ?? null); setQty(1); }, [p?.id]);
  if (!p) return <NotFound />;
  const saved = wishlist.includes(p.id);
  const related = PRODUCTS.filter((x) => x.id !== p.id && (x.category === p.category || x.collections.some((c) => p.collections.includes(c)))).slice(0, 4);
  const out = p.availability === 'out-of-stock';
  const onAdd = async () => {
    setPressed(true);
    await add(p, { size, qty, imgEl: root.current?.querySelector('.gal__img') });
    setTimeout(() => setPressed(false), 900);
  };
  return (
    <>
      <div className="pd" ref={root}>
        <ProductGallery images={p.images} name={p.name} />
        <div className="pd__info">
          <nav className="crumbs" aria-label="Breadcrumb"><Link to="/">Home</Link> / <Link to={`/shop?category=${p.category}`}>{p.category}</Link> / <span>{p.name}</span></nav>
          <h1 className="serif">{p.name}</h1>
          <p className="pd__rate"><Star size={15} fill="currentColor" strokeWidth={0} /> {p.rating} <span>({p.reviews} reviews)</span>{p.bestseller && <em>Bestseller</em>}</p>
          <p className="pd__price">{inr(p.price)}{p.compareAtPrice && <><s>{inr(p.compareAtPrice)}</s><b>{pct(p.price, p.compareAtPrice)}% off</b></>}</p>
          <p className="pd__desc">{p.description}</p>
          <dl className="specs">
            <div><dt>Material</dt><dd>{p.material}</dd></div>
            <div><dt>Stone</dt><dd>{p.stone}</dd></div>
            <div><dt>Availability</dt><dd className={`stock stock--${p.availability}`}>{out ? 'Sold out' : p.availability === 'low-stock' ? `Only ${p.stock} left` : 'In stock'}</dd></div>
          </dl>
          {p.sizes.length > 1 && (
            <fieldset className="sizes"><legend>Size {p.category === 'Rings' && <span className="fine">(Indian ring sizes)</span>}</legend>
              {p.sizes.map((s) => <label key={s} className={size === s ? 'is-on' : ''}><input type="radio" name="size" checked={size === s} onChange={() => setSize(s)} />{s}</label>)}
            </fieldset>
          )}
          <div className="pd__buy">
            <div className="qty qty--lg" role="group" aria-label="Quantity">
              <button aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={15} /></button><output aria-live="polite">{qty}</output><button aria-label="Increase quantity" onClick={() => setQty(Math.min(10, qty + 1))}><Plus size={15} /></button>
            </div>
            <motion.button className="btn btn--dark pd__add" disabled={out} onClick={onAdd} animate={pressed ? { scale: [1, 0.97, 1] } : {}} transition={{ duration: 0.4 }}>
              <AnimatePresence mode="wait" initial={false}><motion.span key={pressed ? 'a' : 'b'} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: 0.2 }}>{out ? 'Sold out' : pressed ? 'Added to bag' : 'Add to bag'}</motion.span></AnimatePresence>
            </motion.button>
            <button className={`pd__wish ${saved ? 'is-on' : ''}`} aria-pressed={saved} aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'} onClick={() => toggleWish(p.id)}>
              <motion.span key={String(saved)} animate={{ scale: saved ? [1.5, 1] : 1 }} transition={{ duration: 0.4 }}><Heart size={20} strokeWidth={1.4} fill={saved ? 'currentColor' : 'none'} /></motion.span>
            </button>
          </div>
          <ul className="pd__trust">
            <li><Truck size={20} strokeWidth={1.3} />Free insured shipping</li><li><RotateCcw size={20} strokeWidth={1.3} />7-day returns</li><li><ShieldCheck size={20} strokeWidth={1.3} />Lifetime care</li><li><Gift size={20} strokeWidth={1.3} />Gift packaging</li>
          </ul>
          <Acc title="Delivery" open><p>Orders are dispatched within 2 to 4 working days, fully insured and signed for on arrival. Ring sizes can be exchanged once within 7 days of delivery.</p></Acc>
          <Acc title="Care"><p>Put jewellery on last and take it off first. Clean with warm water, mild soap and a soft brush, then dry with a soft cloth. Store each piece separately in the pouch provided.</p></Acc>
          <Acc title="Details"><p>{p.material}. {p.stone === 'Polished gold' ? 'No stones, polished finish.' : `Set with ${p.stone.toLowerCase()}.`} Product code {p.id}.</p></Acc>
        </div>
      </div>
      <section className="fg" aria-labelledby="rel"><div className="sec-head"><h2 id="rel" className="serif">You may also like</h2></div><div className="pgrid grid-4">{related.map((r) => <ProductCard key={r.id} product={r} sizes="(min-width: 1024px) 24vw, 48vw" />)}</div></section>
      <div className="pd__sticky" aria-hidden={out}>
        <div><b>{p.name}</b><span>{inr(p.price)}</span></div>
        <button className="btn btn--dark" disabled={out} onClick={onAdd}>Add to bag</button>
      </div>
    </>
  );
}
