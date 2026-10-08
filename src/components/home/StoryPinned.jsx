import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import useGsap from '../../hooks/useGsap';
import Crop from '../Crop';

const CHAPTERS = [
  { title: 'Worn close', text: 'A ring is the piece you notice most, because it is always in your line of sight. We cut our settings low so they sit comfortably through a whole day.', crop: { x: 64, y: 58, z: 2.1 }, label: 'A hand resting under the chin, wearing a diamond cluster ring' },
  { title: 'Made to move', text: 'Earrings should catch the light when you turn your head, and be light enough that you forget them. Every drop is balanced by hand before it is finished.', crop: { x: 72, y: 34, z: 2.3 }, label: 'A diamond drop earring in warm light' },
  { title: 'Kept for good', text: 'The pieces people keep are the ones attached to a day, a person or a decision. We make them to be handed down, repaired, and worn again.', crop: { x: 82, y: 66, z: 1.7 }, label: 'A diamond necklace resting on the collarbone' },
];
export default function StoryPinned() {
  const ref = useRef(null);
  const [active, setActive] = useState(0);
  useGsap(ref, ({ gsap, ScrollTrigger }) => {
    ScrollTrigger.create({ trigger: ref.current, start: 'top top', end: 'bottom bottom', onUpdate: (s) => setActive(Math.min(CHAPTERS.length - 1, Math.floor(s.progress * CHAPTERS.length))) });
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('.sp__frame', { yPercent: 8 }, { yPercent: -8, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    return () => mm.revert();
  });
  return (
    <section className="sp" ref={ref} aria-labelledby="sp-title">
      <div className="sp__stage">
        <div className="sp__media">
          <div className="sp__frame">
            {CHAPTERS.map((c, i) => (
              <Crop key={c.title} className={`sp__crop ${i === active ? 'is-on' : ''}`} label={c.label} {...c.crop} />
            ))}
          </div>
          <p className="sp__count" aria-hidden="true">{String(active + 1).padStart(2, '0')} / {String(CHAPTERS.length).padStart(2, '0')}</p>
        </div>
        <div className="sp__copy">
          <h2 id="sp-title" className="serif">The art of wearing <em>a story.</em></h2>
          <div className="sp__chapters">
            {CHAPTERS.map((c, i) => (
              <article key={c.title} className={`sp__ch ${i === active ? 'is-on' : ''}`}>
                <h3>{c.title}</h3><p>{c.text}</p>
              </article>
            ))}
          </div>
          <Link to="/about" className="link-arrow">Read our story</Link>
        </div>
      </div>
    </section>
  );
}
