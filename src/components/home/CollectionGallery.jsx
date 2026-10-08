import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import useGsap from '../../hooks/useGsap';
import Img from '../Img';
import { COLLECTIONS } from '../../data/collections';

const SHOW = ['rings', 'necklaces', 'earrings', 'bracelets', 'bridal', 'diamond'];
export default function CollectionGallery() {
  const ref = useRef(null);
  useGsap(ref, ({ gsap }) => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray('.cg__card').forEach((card, i) => {
        gsap.fromTo(card, { clipPath: 'inset(12% 10% 12% 10%)', y: 70 + (i % 3) * 30 }, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, ease: 'none', scrollTrigger: { trigger: card, start: 'top 96%', end: 'top 48%', scrub: 0.6 } });
        gsap.fromTo(card.querySelector('img'), { yPercent: -9, scale: 1.18 }, { yPercent: 9, scale: 1.18, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
      gsap.fromTo('.cg__head h2', { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, ease: 'power3.out', scrollTrigger: { trigger: '.cg__head', start: 'top 85%', end: 'top 55%', scrub: 0.5 } });
    });
    return () => mm.revert();
  });
  return (
    <section className="cg" ref={ref} aria-labelledby="cg-title">
      <div className="cg__head">
        <h2 id="cg-title" className="serif">Our Collections</h2>
        <p>Distinct designs for every chapter of your story.</p>
        <Link to="/collections" className="link-arrow">View all <ArrowUpRight size={16} /></Link>
      </div>
      <div className="cg__grid">
        {SHOW.map((id, i) => {
          const c = COLLECTIONS.find((x) => x.id === id);
          return (
            <Link key={id} to={`/shop?collection=${id}`} className={`cg__card cg__card--${i + 1}`} aria-label={`${c.name}, ${c.count} designs`}>
              <Img src={c.cover} srcSet={`${c.coverXs} 480w, ${c.coverSm} 800w, ${c.cover} 1200w`} sizes="(min-width: 900px) 40vw, 90vw" alt={c.coverAlt} />
              <span className="cg__shade" />
              <span className="cg__label"><b>{c.name}</b><em>{c.count} designs</em></span>
              <span className="cg__arrow"><ArrowUpRight size={18} strokeWidth={1.4} /></span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
