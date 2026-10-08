import { useRef } from 'react';
import useGsap from '../../hooks/useGsap';
import { edImg, edSrcSet, edAlt } from '../../data/products';

const STEPS = [
  { id: 'atelier-bench', title: 'Drawn and modelled', text: 'Each design starts as a sketch and a wax model, checked for proportion and for how it sits on the hand.' },
  { id: 'gold-bars', title: 'Cast in gold', text: 'We work in 18 karat rose, yellow and white gold, cast in small batches and cleaned by hand.' },
  { id: 'gem-trays', title: 'Stones chosen and set', text: 'Every stone is selected by eye, then set under magnification so it sits true and secure.' },
  { id: 'plinth-ring', title: 'Finished slowly', text: 'The last stage is polishing in several passes. It is where a piece stops looking made and starts looking finished.' },
];
export default function Craft() {
  const ref = useRef(null);
  useGsap(ref, ({ gsap }) => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray('.craft__step').forEach((s) => {
        gsap.fromTo(s.querySelector('img'), { yPercent: -10, scale: 1.2 }, { yPercent: 10, scale: 1.2, ease: 'none', scrollTrigger: { trigger: s, start: 'top bottom', end: 'bottom top', scrub: true } });
        gsap.fromTo(s.querySelector('.craft__txt'), { y: 50, opacity: 0 }, { y: 0, opacity: 1, ease: 'power3.out', scrollTrigger: { trigger: s, start: 'top 75%', end: 'top 45%', scrub: 0.5 } });
      });
    });
    return () => mm.revert();
  });
  return (
    <section className="craft" ref={ref} aria-labelledby="craft-title">
      <div className="craft__intro">
        <h2 id="craft-title" className="serif">Craftsmanship, <em>step by step</em></h2>
        <p>Four stages, each done by a person who has done it thousands of times.</p>
      </div>
      <ol className="craft__list">
        {STEPS.map((s, i) => (
          <li key={s.id} className={`craft__step ${i % 2 ? 'is-flip' : ''}`}>
            <figure className="craft__fig"><img src={edImg(s.id, 800)} srcSet={edSrcSet(s.id)} sizes="(min-width: 900px) 40vw, 90vw" alt={edAlt(s.id)} loading="lazy" /></figure>
            <div className="craft__txt"><span className="craft__n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><h3 className="serif">{s.title}</h3><p>{s.text}</p></div>
          </li>
        ))}
      </ol>
    </section>
  );
}
