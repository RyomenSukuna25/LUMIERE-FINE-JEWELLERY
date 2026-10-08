import { useRef } from 'react';
import { Link } from 'react-router-dom';
import useGsap from '../../hooks/useGsap';
import { useLenisInstance } from '../../hooks/useLenis';
import { LotusMark } from '../Logo';
import { prefersReducedMotion } from '../../utils/format';

export default function Hero() {
  const root = useRef(null);
  const lenis = useLenisInstance();
  useGsap(root, ({ gsap, ScrollTrigger }) => {
    const html = document.documentElement;
    const reduce = prefersReducedMotion();
    const seen = sessionStorage.getItem('lm_intro') === '1';
    const q = (s) => root.current.querySelector(s);
    const lines = root.current.querySelectorAll('.hl > span');
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // scroll-driven depth
    gsap.to('.hero__scroll', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__img', { scale: 1.12, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__content', { yPercent: -10, opacity: 0.1, ease: 'none', scrollTrigger: { trigger: root.current, start: '18% top', end: 'bottom 35%', scrub: true } });
    gsap.to('.hero__shade', { opacity: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } });

    // restrained mouse movement (desktop only)
    let off = () => {};
    if (fine && !reduce) {
      const mx = gsap.quickTo('.hero__mouse', 'x', { duration: 1.4, ease: 'power3' });
      const my = gsap.quickTo('.hero__mouse', 'y', { duration: 1.4, ease: 'power3' });
      const tx = gsap.quickTo('.hero__content', 'x', { duration: 1.6, ease: 'power3' });
      const mv = (e) => { const nx = e.clientX / window.innerWidth - 0.5; const ny = e.clientY / window.innerHeight - 0.5; mx(nx * -22); my(ny * -14); tx(nx * 8); };
      root.current.addEventListener('pointermove', mv); off = () => root.current?.removeEventListener('pointermove', mv);
    }

    if (reduce) {
      html.dataset.intro = 'done'; gsap.set('.hero__curtain', { display: 'none' }); return () => off();
    }
    html.dataset.intro = 'play';
    lenis?.stop();
    gsap.set('.hero__img', { scale: 1.24 });
    gsap.set(['.hero__eyebrow', '.hero__desc', '.hero__cta', '.hero__cue'], { opacity: 0, y: 22 });
    gsap.set(lines, { yPercent: 118 });
    gsap.set('.hero__curtain', { yPercent: 0 });
    gsap.set('.hero__mark', { opacity: 0, y: 10 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { html.dataset.intro = 'done'; lenis?.start(); sessionStorage.setItem('lm_intro', '1'); } });
    if (!seen) {
      tl.to('.hero__mark', { opacity: 1, y: 0, duration: 0.9 }, 0.25).to('.hero__mark', { opacity: 0, duration: 0.45, ease: 'power2.in' }, 1.55);
    }
    const t0 = seen ? 0.05 : 1.75;
    tl.to('.hero__curtain', { yPercent: -101, duration: seen ? 0.8 : 1.25, ease: 'power3.inOut' }, t0)
      .to('.hero__img', { scale: 1.06, duration: 2.6, ease: 'power2.out' }, t0)
      .to('.hero__eyebrow', { opacity: 1, y: 0, duration: 0.8 }, t0 + 1.0)
      .to(lines[0], { yPercent: 0, duration: 1.05 }, t0 + 1.15)
      .to(lines[1], { yPercent: 0, duration: 1.05 }, t0 + 1.3)
      .to(lines[2], { yPercent: 0, duration: 1.1 }, t0 + 1.45)
      .to('.hero__desc', { opacity: 1, y: 0, duration: 0.9 }, t0 + 1.85)
      .to('.hero__cta', { opacity: 1, y: 0, duration: 0.9 }, t0 + 2.05)
      .add(() => { html.dataset.intro = 'done'; }, t0 + 2.2)
      .to('.hero__cue', { opacity: 1, y: 0, duration: 0.9 }, t0 + 2.5);
    return () => { off(); html.dataset.intro = 'done'; lenis?.start(); tl.kill(); };
  }, [lenis]);

  return (
    <section className="hero" ref={root} aria-label="LUMIÈRE Fine Jewellery">
      <div className="hero__curtain" aria-hidden="true"><div className="hero__mark"><LotusMark size={56} /><span>LUMIÈRE</span></div></div>
      <div className="hero__media">
        <div className="hero__scroll"><div className="hero__mouse">
          <picture>
            <source media="(max-width: 700px)" srcSet="/images/hero-1100.jpg" />
            <img className="hero__img" src="/images/hero.jpg" width="1672" height="941" fetchpriority="high" alt="A woman in warm light, her chin resting on a hand that wears a diamond ring, with diamond drop earrings and a necklace." />
          </picture>
        </div></div>
      </div>
      <div className="hero__shade" aria-hidden="true" />
      <div className="hero__content">
        <p className="hero__eyebrow">FINE JEWELLERY</p>
        <h1 aria-label="Elegance lives in every detail.">
          <span className="hl" aria-hidden="true"><span>Elegance</span></span>
          <span className="hl" aria-hidden="true"><span>Lives in</span></span>
          <span className="hl hl--it" aria-hidden="true"><span><em>Every Detail.</em></span></span>
        </h1>
        <p className="hero__desc">Timeless designs.<br />Thoughtfully crafted.<br />Made to be part of your story.</p>
        <div className="hero__cta"><Link className="btn btn--gold" to="/collections">EXPLORE COLLECTIONS</Link></div>
      </div>
      <a className="hero__cue" href="#statement" onClick={(e) => { e.preventDefault(); const t = document.getElementById('statement'); lenis ? lenis.scrollTo(t, { duration: 1.6 }) : t.scrollIntoView({ behavior: 'smooth' }); }}>
        <span className="hero__cue-line" aria-hidden="true" /><span>SCROLL</span>
      </a>
    </section>
  );
}
