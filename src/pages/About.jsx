import { useRef } from 'react';
import { Link } from 'react-router-dom';
import useGsap from '../hooks/useGsap';
import Crop from '../components/Crop';
import { edImg, edSrcSet, edAlt } from '../data/products';

const VALUES = [
  ['Materials', 'We work in 18 karat rose, yellow and white gold, and in diamonds, emeralds, rubies, sapphires and pearls chosen one stone at a time.', 'gold-bars'],
  ['Design', 'Restraint first. Clean lines, honest proportions, and settings low enough to live with every day.', 'plinth-ring'],
  ['Making', 'Wax, cast, set, polish. Each step is done by hand in Mumbai by people who have done it for years.', 'atelier-bench'],
  ['Keeping', 'Free cleaning and resizing for the life of the piece, because jewellery should be handed down, not replaced.', 'jewel-box'],
];
export default function About() {
  const ref = useRef(null);
  useGsap(ref, ({ gsap }) => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray('.ab__v').forEach((v) => gsap.fromTo(v.querySelector('img'), { yPercent: -8, scale: 1.18 }, { yPercent: 8, scale: 1.18, ease: 'none', scrollTrigger: { trigger: v, start: 'top bottom', end: 'bottom top', scrub: true } }));
      gsap.fromTo('.ab__big', { yPercent: 14 }, { yPercent: -14, ease: 'none', scrollTrigger: { trigger: '.ab__open', start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    return () => mm.revert();
  });
  return (
    <div ref={ref}>
      <section className="ab__open">
        <Crop className="ab__crop" x={72} y={38} z={1.15} label="A woman in warm light wearing LUMIÈRE jewellery" />
        <h1 className="ab__big serif">Modern luxury, <em>made slowly.</em></h1>
      </section>
      <section className="ab__intro"><p className="serif">LUMIÈRE is a fine jewellery house in Mumbai. We design pieces to be worn every day and kept for decades, and we believe luxury comes from proportion, materials and patience, not from decoration.</p></section>
      {VALUES.map(([t, d, img], i) => (
        <section key={t} className={`ab__v ${i % 2 ? 'is-flip' : ''}`}>
          <figure><img src={edImg(img, 800)} srcSet={edSrcSet(img)} sizes="(min-width: 900px) 50vw, 100vw" alt={edAlt(img)} loading="lazy" /></figure>
          <div><span className="meta">0{i + 1}</span><h2 className="serif">{t}</h2><p>{d}</p></div>
        </section>
      ))}
      <section className="ab__cta"><h2 className="serif">Visit us, unhurried.</h2><p>Private appointments are available every day, in the showroom or at home.</p><Link to="/contact" className="btn btn--dark">Book a viewing</Link></section>
    </div>
  );
}
