import { useRef } from 'react';
import useGsap from '../../hooks/useGsap';
import { edImg, edSrcSet } from '../../data/products';

const split = (s) => s.split(' ').map((w, i) => <span className="w" key={i}>{w}&nbsp;</span>);

export default function Statement() {
  const ref = useRef(null);
  useGsap(ref, ({ gsap }) => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom bottom', scrub: 0.7 } });
      tl.fromTo('.st__w', { opacity: 0.12 }, { opacity: 1, stagger: 0.08, duration: 0.5 }, 0)
        .fromTo('.st__l1', { yPercent: 0 }, { yPercent: -95, duration: 1 }, 0.35)
        .fromTo('.st__l2', { yPercent: 0 }, { yPercent: 95, duration: 1 }, 0.35)
        .fromTo('.st__media', { clipPath: 'inset(49% 14% 49% 14%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 }, 0.35)
        .fromTo('.st__img', { scale: 1.45 }, { scale: 1, duration: 1.2 }, 0.35)
        .fromTo('.st__shade', { opacity: 0.2 }, { opacity: 0.55, duration: 1 }, 0.35)
        .fromTo('.st__cap', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4 }, 1.2);
    });
    return () => mm.revert();
  });
  return (
    <section id="statement" className="st" ref={ref} aria-label="Our promise">
      <div className="st__stage">
        <div className="st__media" aria-hidden="true">
          <img className="st__img" src={edImg('macro-diamond', 1200)} srcSet={edSrcSet('macro-diamond')} sizes="100vw" alt="" loading="lazy" />
          <div className="st__shade" />
        </div>
        <h2 className="st__text">
          <span className="st__l1">{split('Designed to be noticed.').map((w, i) => <span key={i} className="st__w">{w}</span>)}</span>
          <span className="st__l2"><em>{split('Made to be remembered.').map((w, i) => <span key={i} className="st__w">{w}</span>)}</em></span>
        </h2>
        <p className="st__cap">Every piece is designed in Mumbai and finished by hand, so it looks the same in daylight as it does at night.</p>
      </div>
    </section>
  );
}
