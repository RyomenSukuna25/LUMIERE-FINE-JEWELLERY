import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import FilterPanel from './FilterPanel';
import { useScrollLock } from '../hooks/useLenis';

export default function FilterDrawer({ open, onClose, f, set, clear, count }) {
  useScrollLock(open);
  return (
    <AnimatePresence>
      {open && (
        <div className="drawer-root" role="dialog" aria-modal="true" aria-label="Filters">
          <motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside className="drawer drawer--sheet" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.4 }} onDragEnd={(_, i) => i.offset.y > 120 && onClose()}>
            <header className="drawer__hd"><h2>Filters</h2><button className="icon-btn" aria-label="Close filters" onClick={onClose}><X size={22} strokeWidth={1.3} /></button></header>
            <div className="drawer__body" data-lenis-prevent><FilterPanel f={f} set={set} clear={clear} /></div>
            <footer className="drawer__ft"><button className="btn btn--dark btn--block" onClick={onClose}>Show {count} {count === 1 ? 'piece' : 'pieces'}</button></footer>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
