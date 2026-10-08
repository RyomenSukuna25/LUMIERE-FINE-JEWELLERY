import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import useGsap from '../../hooks/useGsap';
import Crop from '../Crop';
import ProductCard from '../ProductCard';
import Newsletter from '../Newsletter';
import { PRODUCTS, edImg, edSrcSet } from '../../data/products';
import { JOURNAL } from '../../data/journal';
import { dateFmt } from '../../utils/format';

export function EditorialQuote() {
  const ref = useRef(null);
  useGsap(ref, ({ gsap }) => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('.eq__crop', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top 80%', end: 'top 30%', scrub: 0.6 } });
      gsap.fromTo('.eq__q', { yPercent: 12 }, { yPercent: -12, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    return () => mm.revert();
  });
  return (
    <section className="eq" ref={ref}>
      <Crop className="eq__crop" x={78} y={42} z={1.25} label="Portrait of a woman in warm light wearing LUMIÈRE jewellery" />
      <blockquote className="eq__q"><p className="serif">“Jewellery should feel like part of you, not something you are wearing.”</p><footer>The LUMIÈRE design studio, Mumbai</footer><Link to="/about" className="link-arrow">Our philosophy <ArrowUpRight size={16} /></Link></blockquote>
    </section>
  );
}
export function FeaturedGrid() {
  const items = PRODUCTS.filter((p) => p.featured).slice(0, 8);
  return (
    <section className="fg" aria-labelledby="fg-title">
      <div className="sec-head"><h2 id="fg-title" className="serif">Featured jewellery</h2><Link to="/shop" className="link-arrow">Shop all <ArrowUpRight size={16} /></Link></div>
      <div className="pgrid grid-4">{items.map((p, i) => <ProductCard key={p.id} product={p} priority={false} sizes="(min-width: 1024px) 24vw, 48vw" className={i === 0 ? '' : ''} />)}</div>
    </section>
  );
}
export function JournalTeaser() {
  return (
    <section className="jt" aria-labelledby="jt-title">
      <div className="sec-head"><h2 id="jt-title" className="serif">From the journal</h2><Link to="/journal" className="link-arrow">All stories <ArrowUpRight size={16} /></Link></div>
      <div className="jt__grid">
        {JOURNAL.slice(0, 3).map((a) => (
          <Link key={a.id} to={`/journal/${a.id}`} className="jcard">
            <figure><img src={edImg(a.image, 800)} srcSet={edSrcSet(a.image)} sizes="(min-width: 900px) 30vw, 90vw" alt="" loading="lazy" /></figure>
            <p className="meta">{a.category} · {a.read} min read</p>
            <h3 className="serif">{a.title}</h3>
            <p>{a.excerpt}</p>
            <span className="jcard__date">{dateFmt(a.date, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
export function NewsletterBand() {
  return (
    <section className="nb" aria-labelledby="nb-title">
      <img src={edImg('silk-noir', 1200)} srcSet={edSrcSet('silk-noir')} sizes="100vw" alt="" loading="lazy" />
      <div className="nb__in"><h2 id="nb-title" className="serif">Be the first to see what is new.</h2><p>Private previews, appointment invitations and stories from the atelier.</p><Newsletter /></div>
    </section>
  );
}
