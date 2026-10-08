import { useEffect, useRef } from 'react';
import { animate } from 'framer-motion';
import { inr } from '../utils/format';

export default function AnimatedNumber({ value, format = inr }) {
  const ref = useRef(null); const prev = useRef(value);
  useEffect(() => {
    const node = ref.current; if (!node) return undefined;
    const ctrl = animate(prev.current, value, { duration: 0.5, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => { node.textContent = format(v); } });
    prev.current = value; return () => ctrl.stop();
  }, [value, format]);
  return <span ref={ref}>{format(value)}</span>;
}
