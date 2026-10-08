import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import { api } from '../api';
import { byId, productImg } from '../data/products';
import { inr, dateFmt } from '../utils/format';

const TABS = [['', 'Overview'], ['orders', 'Orders'], ['wishlist', 'Wishlist'], ['addresses', 'Addresses'], ['profile', 'Profile'], ['preferences', 'Preferences']];

function Overview({ session, orders }) {
  const { wishlist } = useStore();
  return (
    <div className="acc-p">
      <h2 className="serif">Hello, {session.name.split(' ')[0]}.</h2>
      <div className="acc-p__stats"><div><b>{orders.length}</b><span>Orders</span></div><div><b>{wishlist.length}</b><span>Saved pieces</span></div><div><b>{inr(orders.reduce((s, o) => s + o.total, 0))}</b><span>Total spent</span></div></div>
      <p>{orders.length ? 'Your most recent order is below.' : 'You have not placed an order yet.'}</p>
      {orders[0] && <Link to={`/order/${orders[0].number.replace('#', '')}`} className="acc-p__order"><span><b>{orders[0].number}</b><em>{dateFmt(orders[0].placed)} · {orders[0].items.length} item(s)</em></span><strong>{inr(orders[0].total)}</strong><i className={`ost ost--${orders[0].status.toLowerCase()}`}>{orders[0].status}</i></Link>}
      {!orders.length && <Link to="/shop" className="btn btn--dark">Start browsing</Link>}
    </div>
  );
}
function Orders({ orders }) {
  if (!orders.length) return <div className="acc-p"><h2 className="serif">Orders</h2><p>No orders yet. Orders you place will appear here.</p><Link to="/shop" className="btn btn--dark">Browse jewellery</Link></div>;
  return (
    <div className="acc-p"><h2 className="serif">Orders</h2>
      {orders.map((o) => (
        <Link key={o.id} to={`/order/${o.number.replace('#', '')}`} className="acc-p__order">
          <span className="acc-p__thumbs">{o.items.slice(0, 3).map((it, i) => { const p = byId(it.id); return p ? <img key={i} src={productImg(p, 0, 480)} alt="" /> : null; })}</span>
          <span><b>{o.number}</b><em>{dateFmt(o.placed)} · {o.items.map((i) => i.name).join(', ')}</em></span><strong>{inr(o.total)}</strong><i className={`ost ost--${o.status.toLowerCase()}`}>{o.status}</i>
        </Link>
      ))}
    </div>
  );
}
function Wishlist() {
  const { wishlist } = useStore();
  const items = wishlist.map(byId).filter(Boolean);
  return (
    <div className="acc-p"><h2 className="serif">Wishlist</h2>
      {items.length ? <div className="pgrid grid-3">{items.map((p) => <ProductCard key={p.id} product={p} sizes="30vw" />)}</div> : <><p>Tap the heart on any piece to save it here.</p><Link to="/shop" className="btn btn--dark">Browse jewellery</Link></>}
    </div>
  );
}
function Addresses({ email }) {
  const [p, setP] = useState(() => api.profile.get(email)); const [a, setA] = useState({ label: '', line: '', city: '', pin: '' });
  const add = (e) => { e.preventDefault(); if (!a.line) return; const n = { ...p, addresses: [...p.addresses, { ...a, id: Date.now() }] }; api.profile.set(email, n); setP(n); setA({ label: '', line: '', city: '', pin: '' }); };
  const del = (id) => { const n = { ...p, addresses: p.addresses.filter((x) => x.id !== id) }; api.profile.set(email, n); setP(n); };
  return (
    <div className="acc-p"><h2 className="serif">Addresses</h2>
      {p.addresses.map((x) => <div key={x.id} className="acc-p__addr"><span><b>{x.label || 'Address'}</b><em>{x.line}, {x.city} {x.pin}</em></span><button className="u" onClick={() => del(x.id)}>Remove</button></div>)}
      <form onSubmit={add} className="acc-p__form"><div className="field"><label htmlFor="al">Label</label><input id="al" value={a.label} onChange={(e) => setA({ ...a, label: e.target.value })} placeholder="Home" /></div><div className="field"><label htmlFor="ad">Address</label><input id="ad" value={a.line} onChange={(e) => setA({ ...a, line: e.target.value })} /></div><div className="co__f2"><div className="field"><label htmlFor="ac">City</label><input id="ac" value={a.city} onChange={(e) => setA({ ...a, city: e.target.value })} /></div><div className="field"><label htmlFor="ap">PIN code</label><input id="ap" value={a.pin} onChange={(e) => setA({ ...a, pin: e.target.value })} /></div></div><button className="btn btn--dark">Add address</button></form>
    </div>
  );
}
function Profile({ session }) {
  const [p, setP] = useState(() => api.profile.get(session.email)); const [ok, setOk] = useState(false);
  const save = (e) => { e.preventDefault(); api.profile.set(session.email, p); setOk(true); setTimeout(() => setOk(false), 2000); };
  return (
    <div className="acc-p"><h2 className="serif">Profile</h2>
      <form onSubmit={save} className="acc-p__form"><div className="field"><label htmlFor="pn">Name</label><input id="pn" value={session.name} readOnly /></div><div className="field"><label htmlFor="pe">Email</label><input id="pe" value={session.email} readOnly /></div><div className="field"><label htmlFor="pp">Phone</label><input id="pp" inputMode="tel" value={p.phone} onChange={(e) => setP({ ...p, phone: e.target.value })} /></div><button className="btn btn--dark">{ok ? 'Saved' : 'Save changes'}</button></form>
    </div>
  );
}
function Preferences({ email }) {
  const [p, setP] = useState(() => api.profile.get(email));
  const set = (k, v) => { const n = { ...p, prefs: { ...p.prefs, [k]: v } }; setP(n); api.profile.set(email, n); };
  return (
    <div className="acc-p"><h2 className="serif">Preferences</h2>
      {[['email', 'Email updates about new pieces'], ['sms', 'SMS delivery updates'], ['appointments', 'Appointment reminders']].map(([k, l]) => <label key={k} className="tog"><input type="checkbox" checked={!!p.prefs[k]} onChange={(e) => set(k, e.target.checked)} /><span>{l}</span></label>)}
      <div className="field"><label htmlFor="pr">I am most interested in</label><select id="pr" value={p.prefs.news} onChange={(e) => set('news', e.target.value)}><option value="new-arrivals">New arrivals</option><option value="bridal">Bridal</option><option value="diamond">Diamond jewellery</option><option value="gold">Gold jewellery</option></select></div>
    </div>
  );
}

export default function Account() {
  const { session, logout } = useAuth();
  const loc = useLocation();
  const [orders, setOrders] = useState([]);
  useEffect(() => { if (session) api.orders.mine().then(setOrders); }, [session, loc.pathname]);
  if (!session) return <Navigate to="/signin" state={{ from: loc.pathname }} replace />;
  if (session.role !== 'CUSTOMER') return <Navigate to="/staff" replace />;
  return (
    <>
      <div className="pg-head"><div><h1 className="serif">My account</h1><p>{session.email}</p></div><button className="btn btn--line" onClick={logout}>Sign out</button></div>
      <div className="acct">
        <nav className="acct__tabs" aria-label="Account sections">{TABS.map(([to, l]) => <NavLink key={to} end={to === ''} to={to ? `/account/${to}` : '/account'} className={({ isActive }) => (isActive ? 'is-on' : '')}>{l}</NavLink>)}</nav>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={loc.pathname} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <Routes location={loc}>
              <Route index element={<Overview session={session} orders={orders} />} />
              <Route path="orders" element={<Orders orders={orders} />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="addresses" element={<Addresses email={session.email} />} />
              <Route path="profile" element={<Profile session={session} />} />
              <Route path="preferences" element={<Preferences email={session.email} />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
