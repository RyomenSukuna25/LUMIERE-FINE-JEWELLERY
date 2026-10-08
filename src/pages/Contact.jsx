import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Contact() {
  const [f, setF] = useState({ name: '', email: '', topic: 'Book a viewing', msg: '' }); const [done, setDone] = useState(false); const [err, setErr] = useState('');
  const submit = (e) => { e.preventDefault(); if (!f.name || !/^\S+@\S+\.\S+$/.test(f.email)) return setErr('Please enter your name and a valid email.'); setErr(''); setDone(true); };
  return (
    <>
      <div className="pg-head"><div><h1 className="serif">Contact</h1><p>Book a private viewing, ask about a piece, or get help with an order.</p></div></div>
      <div className="ct">
        <div className="ct__info"><h2 className="serif">The showroom</h2><p>By appointment, every day.<br />Mumbai, Maharashtra</p><h2 className="serif">Client care</h2><p>care@lumiere.example<br />Monday to Saturday, 10am to 7pm</p><h2 className="serif">Delivery and returns</h2><p>Free insured shipping on every order. Returns and ring-size exchanges within 7 days of delivery.</p></div>
        <AnimatePresence mode="wait">{done ? <motion.p key="d" className="serif ct__ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Thank you, {f.name.split(' ')[0]}. We will reply within one working day.</motion.p> : (
          <motion.form key="f" onSubmit={submit} noValidate exit={{ opacity: 0 }} className="ct__form">
            <div className="field"><label htmlFor="c1">Name</label><input id="c1" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
            <div className="field"><label htmlFor="c2">Email</label><input id="c2" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
            <div className="field"><label htmlFor="c3">Topic</label><select id="c3" value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })}>{['Book a viewing', 'A question about a piece', 'My order', 'Jewellery care'].map((t) => <option key={t}>{t}</option>)}</select></div>
            <div className="field"><label htmlFor="c4">Message</label><textarea id="c4" rows="5" value={f.msg} onChange={(e) => setF({ ...f, msg: e.target.value })} /></div>
            {err && <p className="form-err" role="alert">{err}</p>}
            <button className="btn btn--dark">Send message</button>
          </motion.form>)}</AnimatePresence>
      </div>
    </>
  );
}
