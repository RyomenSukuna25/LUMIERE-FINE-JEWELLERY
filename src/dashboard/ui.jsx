import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export function useAsync(fn, deps = []) {
  const [state, set] = useState({ data: null, error: null, loading: true });
  const run = useCallback(() => { set((s) => ({ ...s, loading: true })); return fn().then((data) => set({ data, error: null, loading: false })).catch((error) => set({ data: null, error, loading: false })); }, deps); // eslint-disable-line
  useEffect(() => { run(); }, [run]);
  return { ...state, reload: run };
}
export const Status = ({ s }) => <span className={`dst dst--${String(s).toLowerCase().replace(/\s+/g, '-')}`}>{s}</span>;
export function Panel({ title, action, children, className = '' }) {
  return <section className={`dpanel ${className}`}>{(title || action) && <header><h2>{title}</h2>{action}</header>}{children}</section>;
}
export function PageHead({ title, sub, children }) {
  return <div className="dhead"><div><h1>{title}</h1>{sub && <p>{sub}</p>}</div><div className="dhead__act">{children}</div></div>;
}
export function Side({ open, onClose, title, children }) {
  useEffect(() => { if (!open) return undefined; const k = (e) => e.key === 'Escape' && onClose(); document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k); }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <div className="dside-root" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div className="dscrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside className="dside" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
            <header><h2>{title}</h2><button className="dbtn dbtn--ghost" aria-label="Close panel" onClick={onClose}><X size={18} /></button></header>
            <div className="dside__body">{children}</div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
export function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="dmodal-root" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div className="dscrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="dmodal" initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.25 }}>
            <header><h2>{title}</h2><button className="dbtn dbtn--ghost" aria-label="Close" onClick={onClose}><X size={18} /></button></header>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
export const Forbidden = ({ msg }) => <div className="dempty"><h2>Not available</h2><p>{msg || 'Your role does not include this module.'}</p></div>;
export const Loading = () => <div className="dempty"><p>Loading…</p></div>;
export function Toasts({ items }) {
  return <div className="dtoasts" role="status" aria-live="polite"><AnimatePresence>{items.map((t) => <motion.div key={t.id} className="dtoast" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}>{t.text}</motion.div>)}</AnimatePresence></div>;
}
