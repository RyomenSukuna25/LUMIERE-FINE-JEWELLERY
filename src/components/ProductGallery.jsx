import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { useScrollLock } from '../hooks/useLenis';

export default function ProductGallery({ images, name }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(null);
  const [lb, setLb] = useState(false);
  useScrollLock(lb);
  const go = (n) => setI((n + images.length) % images.length);
  const img = images[i];
  const move = (e) => { const r = e.currentTarget.getBoundingClientRect(); setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); };
  return (
    <div className="gal">
      <ul className="gal__thumbs" aria-label="Product images">
        {images.map((m, k) => (
          <li key={k}><button className={k === i ? 'is-on' : ''} aria-label={`Show image ${k + 1} of ${images.length}`} aria-current={k === i} onClick={() => setI(k)}><img src={m.thumb} alt="" loading="lazy" /></button></li>
        ))}
      </ul>
      <div className="gal__main" onPointerMove={(e) => e.pointerType === 'mouse' && move(e)} onPointerLeave={() => setZoom(null)}>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.img key={i} className="gal__img" src={img.src} srcSet={img.srcSet} sizes="(min-width: 1024px) 48vw, 100vw" alt={img.alt}
            initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.25} onDragEnd={(_, d) => { if (d.offset.x < -60) go(i + 1); else if (d.offset.x > 60) go(i - 1); }} />
        </AnimatePresence>
        {zoom && <div className="gal__zoom" style={{ backgroundImage: `url(${img.full})`, backgroundPosition: `${zoom.x}% ${zoom.y}%` }} aria-hidden="true" />}
        <button className="gal__expand" aria-label="Open full-size image" onClick={() => setLb(true)}><ZoomIn size={18} strokeWidth={1.4} /></button>
        <div className="gal__dots" aria-hidden="true">{images.map((_, k) => <i key={k} className={k === i ? 'is-on' : ''} />)}</div>
      </div>
      <AnimatePresence>
        {lb && (
          <motion.div className="lb" role="dialog" aria-modal="true" aria-label={`${name} images`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onKeyDown={(e) => { if (e.key === 'Escape') setLb(false); if (e.key === 'ArrowRight') go(i + 1); if (e.key === 'ArrowLeft') go(i - 1); }}>
            <button className="icon-btn lb__x" aria-label="Close" onClick={() => setLb(false)} autoFocus><X size={26} strokeWidth={1.2} /></button>
            <button className="icon-btn lb__p" aria-label="Previous image" onClick={() => go(i - 1)}><ChevronLeft size={30} strokeWidth={1.2} /></button>
            <img src={img.full} alt={img.alt} />
            <button className="icon-btn lb__n" aria-label="Next image" onClick={() => go(i + 1)}><ChevronRight size={30} strokeWidth={1.2} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
