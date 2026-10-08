import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Eye } from 'lucide-react';
import Img from './Img';
import { useStore } from '../context/StoreContext';
import { inr, pct } from '../utils/format';

export default function ProductCard({ product: p, priority = false, sizes, className = '' }) {
  const { wishlist, toggleWish, open } = useStore();
  const saved = wishlist.includes(p.id);
  const ref = useRef(null);
  return (
    <article className={`pcard ${className}`} ref={ref}>
      <div className="pcard__media">
        <Link to={`/product/${p.slug}`} aria-label={`${p.name}, ${inr(p.price)}`} tabIndex={0}>
          <Img className="pcard__a" src={p.images[0].src} srcSet={p.images[0].srcSet} sizes={sizes} alt={p.images[0].alt} eager={priority} />
          <Img className="pcard__b" src={p.images[1].src} srcSet={p.images[1].srcSet} sizes={sizes} alt="" aria-hidden="true" />
        </Link>
        {(p.newArrival || p.compareAtPrice || p.availability !== 'in-stock') && (
          <span className="pcard__tag">{p.availability === 'out-of-stock' ? 'Sold out' : p.availability === 'low-stock' ? 'Few left' : p.compareAtPrice ? `${pct(p.price, p.compareAtPrice)}% off` : 'New'}</span>
        )}
        <button className={`pcard__wish ${saved ? 'is-on' : ''}`} aria-pressed={saved} aria-label={saved ? `Remove ${p.name} from wishlist` : `Save ${p.name} to wishlist`} onClick={() => toggleWish(p.id)}>
          <motion.span key={String(saved)} initial={{ scale: saved ? 0.4 : 1 }} animate={{ scale: saved ? [1.4, 1] : 1 }} transition={{ duration: 0.4 }}><Heart size={18} strokeWidth={1.4} fill={saved ? 'currentColor' : 'none'} /></motion.span>
        </button>
        <button className="pcard__quick" onClick={() => open('quick', p)}><Eye size={15} strokeWidth={1.5} />Quick view</button>
      </div>
      <div className="pcard__info">
        <p className="pcard__cat">{p.category}</p>
        <h3><Link to={`/product/${p.slug}`}>{p.name}</Link></h3>
        <p className="pcard__price">{inr(p.price)}{p.compareAtPrice && <s>{inr(p.compareAtPrice)}</s>}</p>
      </div>
    </article>
  );
}
