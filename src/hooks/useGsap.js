import { useLayoutEffect } from 'react';
import { gsap, ScrollTrigger } from './useLenis';

export default function useGsap(ref, setup, deps = []) {
  useLayoutEffect(() => {
    const ctx = gsap.context(() => setup({ gsap, ScrollTrigger }), ref);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
