import { useRef } from 'react';
import { Link } from 'react-router-dom';
import useGsap from '../../hooks/useGsap';
import ProductCard from '../ProductCard';
import { PRODUCTS } from '../../data/products';

export default function ProductRail() {
  const ref = useRef(null);
  const items = [...PRODUCTS.filter((p) => p.newArrival), ...PRODUCTS.filter((p) => p.bestseller && !p.newArrival)].slice(0, 12);
  useGsap(ref, ({ gsap }) => {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const track = ref.current.querySelector('.rail__track');
      const dist = () => track.scrollWidth - window.innerWidth + window.innerWidth * 0.08;
      gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 } });
      gsap.to('.rail__bar i', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top top', end: () => `+=${dist()}`, scrub: true } });
    });
    return () => mm.revert();
  });
  return (
    <section className="rail" ref={ref} aria-labelledby="rail-title">
      <div className="rail__head">
        <div><h2 id="rail-title" className="serif">New and much-loved</h2><p>Pieces our clients are choosing right now.</p></div>
        <Link to="/shop" className="link-arrow">Shop all jewellery</Link>
      </div>
      <div className="rail__viewport">
        <ul className="rail__track">
          {items.map((p, i) => <li key={p.id}><ProductCard product={p} priority={i < 3} sizes="(min-width: 900px) 26vw, 70vw" /></li>)}
        </ul>
      </div>
      <div className="rail__bar" aria-hidden="true"><i /></div>
    </section>
  );
}
