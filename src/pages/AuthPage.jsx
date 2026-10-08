import { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, ShieldCheck, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LotusMark } from '../components/Logo';
import { ROLES, ROLE_LABEL } from '../data/permissions';

const DEMO = [['Admin', 'admin@lumiere.in', 'lumiere-admin'], ['Manager', 'manager@lumiere.in', 'lumiere-manager'], ['Employee', 'employee@lumiere.in', 'lumiere-employee']];

export default function AuthPage({ mode }) {
  const staff = mode === 'staff';
  const { session, login, register } = useAuth();
  const nav = useNavigate(); const loc = useLocation();
  const [reg, setReg] = useState(false);
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [show, setShow] = useState(false); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const [granted, setGranted] = useState(null);
  const from = loc.state?.from || '/account';
  useEffect(() => { setErr(''); }, [mode, reg]);
  useEffect(() => { if (!granted) return undefined; const t = setTimeout(() => nav('/staff', { replace: true }), 3200); return () => clearTimeout(t); }, [granted, nav]);
  if (session && !granted) return <Navigate to={session.role === 'CUSTOMER' ? from : '/staff'} replace />;

  const submit = async (e) => {
    e.preventDefault(); setErr('');
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setErr('Enter a valid email address.');
    if (f.password.length < 6) return setErr('Password must be at least 6 characters.');
    if (reg && !staff && !f.name.trim()) return setErr('Enter your name.');
    setBusy(true);
    try {
      const s = reg && !staff ? await register(f) : await login({ email: f.email, password: f.password, staff });
      if (staff) setGranted(s); else nav(from, { replace: true });
    } catch (x) { setErr(x.message); } finally { setBusy(false); }
  };
  return (
    <div className="auth">
      <div className="auth__bg" aria-hidden="true" />
      <AnimatePresence mode="wait">
        {granted ? (
          <motion.div key="g" className="auth__card auth__card--grant" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <LotusMark size={44} className="auth__mark" />
            <h1 className="serif">Access granted</h1>
            <p>Welcome, {granted.name}. Redirecting to your dashboard…</p>
            <div className="grant">
              <p><ClipboardList size={16} /> Role <b>{ROLE_LABEL[granted.role]}</b></p>
              <p><ShieldCheck size={16} /> Permissions</p>
              <ul>{(ROLES[granted.role] || []).map((p) => <li key={p}>✓ {p}</li>)}</ul>
              <motion.i initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 3, ease: 'linear' }} />
            </div>
          </motion.div>
        ) : (
          <motion.div key="f" className="auth__card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <LotusMark size={44} className="auth__mark" />
            <h1 className="serif">{staff ? 'Staff access' : reg ? 'Create account' : 'Welcome back'}</h1>
            <p className="auth__sub">{staff ? 'Sign in with your LUMIÈRE staff credentials.' : reg ? 'Save your wishlist and follow your orders.' : 'Sign in to your account'}</p>
            <div className="auth__tabs" role="tablist">
              <Link role="tab" aria-selected={!staff} to="/signin" className={!staff ? 'is-on' : ''}>Customer Login</Link>
              <Link role="tab" aria-selected={staff} to="/staff/login" className={staff ? 'is-on' : ''}>Staff Login</Link>
            </div>
            <form onSubmit={submit} noValidate>
              {reg && !staff && <div className="field"><label htmlFor="a-name">Full name</label><input id="a-name" autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>}
              <div className="field"><label htmlFor="a-email">Email</label><input id="a-email" type="email" autoComplete="email" placeholder="you@example.com" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
              <div className="field"><label htmlFor="a-pass">Password</label>
                <div className="pw"><input id="a-pass" type={show ? 'text' : 'password'} autoComplete={reg ? 'new-password' : 'current-password'} placeholder="Enter your password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /><button type="button" className="icon-btn" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
              </div>
              {err && <p className="form-err" role="alert">{err}</p>}
              <button className="btn btn--gold btn--block" disabled={busy}>{busy ? 'Please wait…' : reg && !staff ? 'Create account' : 'Sign in'} <ArrowRight size={16} /></button>
            </form>
            {!staff && <p className="auth__alt">{reg ? 'Already have an account?' : 'New to LUMIÈRE?'} <button className="u" onClick={() => setReg(!reg)}>{reg ? 'Sign in' : 'Create account'}</button></p>}
            {staff && (
              <details className="auth__demo"><summary>Prototype access</summary>
                <p>Demo staff accounts for this prototype. Real deployments authenticate on a server.</p>
                {DEMO.map(([r, e, p]) => <button key={r} type="button" onClick={() => setF({ ...f, email: e, password: p })}><b>{r}</b><span>{e}</span></button>)}
              </details>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
