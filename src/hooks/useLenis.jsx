import { createContext, useContext, useEffect, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../utils/format';

gsap.registerPlugin(ScrollTrigger);
const LenisCtx = createContext(null);
export const useLenisInstance = () => useContext(LenisCtx);

export function LenisProvider({ children }) {
  const [lenis, setLenis] = useState(null);
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const l = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95, smoothWheel: true });
    setLenis(l);
    l.on('scroll', ScrollTrigger.update);
    const tick = (t) => l.raf(t * 1000);
    gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); l.destroy(); setLenis(null); };
  }, []);
  return <LenisCtx.Provider value={lenis}>{children}</LenisCtx.Provider>;
}

// Lock page scroll while an overlay is open (works with Lenis and native).
export function useScrollLock(locked) {
  const lenis = useLenisInstance();
  useEffect(() => {
    if (!locked) return undefined;
    lenis?.stop();
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { lenis?.start(); document.body.style.overflow = prev; };
  }, [locked, lenis]);
}
export { gsap, ScrollTrigger };
