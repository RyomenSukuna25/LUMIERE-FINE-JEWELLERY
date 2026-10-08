import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '../api';

export default function Newsletter({ tone = 'dark' }) {
  const [email, setEmail] = useState(''); const [state, setState] = useState('idle'); const [err, setErr] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) { setErr('Enter a valid email address.'); return; }
    setErr(''); setState('busy'); await api.newsletter.subscribe(email); setState('done');
  };
  return (
    <div className={`news news--${tone}`}>
      <AnimatePresence mode="wait" initial={false}>
        {state === 'done' ? (
          <motion.p key="ok" className="serif news__ok" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>Thank you. You are on the list.</motion.p>
        ) : (
          <motion.form key="f" onSubmit={submit} noValidate exit={{ opacity: 0, y: -8 }}>
            <label htmlFor={`news-${tone}`} className="sr-only">Email address</label>
            <input id={`news-${tone}`} type="email" placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!err} aria-describedby={err ? 'news-err' : undefined} autoComplete="email" />
            <button className="btn btn--gold" disabled={state === 'busy'}>{state === 'busy' ? 'Subscribing…' : 'Subscribe'}</button>
            {err && <p id="news-err" className="form-err" role="alert">{err}</p>}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
