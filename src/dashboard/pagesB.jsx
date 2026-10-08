import { useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Search, Check } from 'lucide-react';
import { api } from '../api';
import { useAsync, Status, Panel, PageHead, Side, Loading, Forbidden } from './ui';
import { useDash } from './DashboardApp';
import { PRODUCTS, CATEGORIES, productImg } from '../data/products';
import { COLLECTIONS } from '../data/collections';
import { JOURNAL } from '../data/journal';
import { PERMISSIONS, ROLES, ROLE_LABEL } from '../data/permissions';
import { monthly } from '../data/seed';
import { inr, dateFmt } from '../utils/format';

const axis = { stroke: '#a39a8d', fontSize: 11, tickLine: false, axisLine: false };
const tip = { contentStyle: { border: '1px solid #e0d6c5', borderRadius: 4, fontSize: 12 } };

export function Customers() {
  const { data, loading, error } = useAsync(() => api.staff.customers(), []);
  const orders = useAsync(() => api.staff.orders().catch(() => []), []);
  const [q, setQ] = useState(''); const [sel, setSel] = useState(null);
  if (loading) return <Loading />; if (error) return <Forbidden msg={error.message} />;
  const spend = (c) => (orders.data || []).filter((o) => o.customerId === c.id && o.status !== 'Cancelled').reduce((s, o) => s + o.total, 0);
  const rows = data.filter((c) => !q || `${c.name} ${c.email} ${c.city}`.toLowerCase().includes(q.toLowerCase()));
  const cur = sel && data.find((c) => c.id === sel); const co = cur ? (orders.data || []).filter((o) => o.customerId === cur.id) : [];
  return (
    <>
      <PageHead title="Customers" sub={`${data.length} customers.`}><label className="dsearch"><Search size={15} /><span className="sr-only">Search customers</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers" /></label></PageHead>
      <Panel><div className="dtable-wrap"><table className="dtable dtable--hover dtable--cards"><thead><tr><th>Name</th><th>Email</th><th>City</th><th>Tier</th><th className="r">Lifetime value</th><th>Joined</th></tr></thead>
        <tbody>{rows.map((c) => <tr key={c.id} tabIndex={0} onClick={() => setSel(c.id)} onKeyDown={(e) => e.key === 'Enter' && setSel(c.id)}><td data-l="Name"><b>{c.name}</b></td><td data-l="Email">{c.email}</td><td data-l="City">{c.city}</td><td data-l="Tier"><Status s={c.tier} /></td><td data-l="Lifetime value" className="r">{inr(spend(c))}</td><td data-l="Joined">{dateFmt(c.joined, { month: 'short', year: 'numeric' })}</td></tr>)}</tbody></table></div></Panel>
      <Side open={!!cur} onClose={() => setSel(null)} title={cur?.name || ''}>
        {cur && <div className="dorder"><div className="dkv"><span>Email</span>{cur.email}</div><div className="dkv"><span>City</span>{cur.city}</div><div className="dkv"><span>Tier</span><Status s={cur.tier} /></div><div className="dkv dkv--total"><span>Lifetime value</span><b>{inr(spend(cur))}</b></div><h3>Orders ({co.length})</h3>{co.slice(0, 8).map((o) => <div className="dline" key={o.id}><span><b>{o.number}</b><em>{dateFmt(o.placed)}</em></span><Status s={o.status} /><b>{inr(o.total)}</b></div>)}</div>}
      </Side>
    </>
  );
}

export function Employees() {
  const { can, toast } = useDash();
  const { data, loading, error, reload } = useAsync(() => api.staff.employees(), []);
  const [sel, setSel] = useState(null);
  if (loading) return <Loading />; if (error) return <Forbidden msg={error.message} />;
  const manage = can('employees.manage'); const cur = sel && data.find((e) => e.id === sel);
  const upd = async (id, patch) => { await api.staff.updateEmployee(id, patch); toast('Employee updated'); reload(); };
  return (
    <>
      <PageHead title="Employees" sub="Staff accounts and roles." />
      <Panel><div className="dtable-wrap"><table className="dtable dtable--hover dtable--cards"><thead><tr><th>Name</th><th>Title</th><th>Role</th><th>Email</th><th>Status</th></tr></thead>
        <tbody>{data.map((e) => <tr key={e.id} tabIndex={0} onClick={() => setSel(e.id)} onKeyDown={(k) => k.key === 'Enter' && setSel(e.id)}><td data-l="Name"><b>{e.name}</b></td><td data-l="Title">{e.title}</td><td data-l="Role">{ROLE_LABEL[e.role]}</td><td data-l="Email">{e.email}</td><td data-l="Status"><Status s={e.active ? 'Active' : 'Inactive'} /></td></tr>)}</tbody></table></div></Panel>
      <Side open={!!cur} onClose={() => setSel(null)} title={cur?.name || ''}>
        {cur && <div className="dorder"><div className="dkv"><span>Role</span>{manage ? <select className="dselect" value={cur.role} onChange={(e) => upd(cur.id, { role: e.target.value })}>{['EMPLOYEE', 'MANAGER', 'ADMIN'].map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}</select> : ROLE_LABEL[cur.role]}</div>
          <h3>Permissions</h3><ul className="dperm">{PERMISSIONS.map((p) => <li key={p} className={ROLES[cur.role].includes(p) ? 'on' : ''}>{ROLES[cur.role].includes(p) ? <Check size={13} /> : <span />}{p}</li>)}</ul>
          {manage ? <button className="dbtn" onClick={() => upd(cur.id, { active: !cur.active })}>{cur.active ? 'Deactivate account' : 'Reactivate account'}</button> : <p className="dnote">Only administrators can change staff accounts.</p>}</div>}
      </Side>
    </>
  );
}

export function CollectionsAdmin() {
  return (
    <>
      <PageHead title="Collections" sub="How the catalogue is grouped on the storefront." />
      <div className="dcards">{COLLECTIONS.map((c) => <div key={c.id} className="dcol-card"><img src={c.coverXs} alt="" /><div><b>{c.name}</b><span>{c.count} products</span><em>{c.blurb}</em></div></div>)}</div>
    </>
  );
}

export function Content() {
  const { toast } = useDash();
  const { data, loading, error } = useAsync(() => api.staff.content(), []);
  const [v, setV] = useState(null);
  if (loading) return <Loading />; if (error) return <Forbidden msg={error.message} />;
  const val = v || data;
  const save = async (e) => { e.preventDefault(); await api.staff.saveContent(val); toast('Content saved'); };
  return (
    <>
      <PageHead title="Content" sub="Storefront copy and journal." />
      <div className="dgrid dgrid--2-1">
        <Panel title="Storefront"><form className="dform" onSubmit={save}><label>Announcement bar<input value={val.announcement} onChange={(e) => setV({ ...val, announcement: e.target.value })} /></label><label>Hero eyebrow<input value={val.heroEyebrow} onChange={(e) => setV({ ...val, heroEyebrow: e.target.value })} /></label><label>Featured collection<select value={val.featuredCollection} onChange={(e) => setV({ ...val, featuredCollection: e.target.value })}>{COLLECTIONS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><div className="dform__act"><button className="dbtn dbtn--dark">Save</button></div></form></Panel>
        <Panel title="Journal articles"><ul className="dlog">{JOURNAL.map((a) => <li key={a.id}><span>{a.title}<em>{a.category} · {dateFmt(a.date)}</em></span><Status s="Published" /></li>)}</ul></Panel>
      </div>
    </>
  );
}

export function Analytics() {
  const orders = useAsync(() => api.staff.orders(), []);
  if (orders.loading) return <Loading />; if (orders.error) return <Forbidden msg={orders.error.message} />;
  const live = orders.data.filter((o) => o.status !== 'Cancelled'); const m = monthly(orders.data).map((x) => ({ ...x, aov: x.orders ? Math.round(x.revenue / x.orders) : 0 }));
  const byCat = CATEGORIES.map((c) => ({ name: c, rev: live.reduce((s, o) => s + o.items.filter((i) => PRODUCTS.find((p) => p.id === i.id)?.category === c).reduce((a, i) => a + i.price * i.qty, 0), 0) }));
  const funnel = [{ name: 'Visits', value: 18420 }, { name: 'Viewed a product', value: 9610 }, { name: 'Added to bag', value: 1930 }, { name: 'Checkout', value: 640 }, { name: 'Ordered', value: live.length }];
  const top = Object.values(live.flatMap((o) => o.items).reduce((a, i) => { a[i.id] = a[i.id] || { ...i, qty: 0 }; a[i.id].qty += i.qty; return a; }, {})).sort((a, b) => b.qty - a.qty).slice(0, 8);
  return (
    <>
      <PageHead title="Analytics" sub="Revenue, order value and conversion. Traffic figures are sample data in this prototype." />
      <div className="dgrid dgrid--2">
        <Panel title="Revenue"><div className="dchart"><ResponsiveContainer width="100%" height={240}><AreaChart data={m}><CartesianGrid stroke="#e9e1d3" vertical={false} /><XAxis dataKey="month" {...axis} /><YAxis {...axis} width={52} tickFormatter={(v) => `${Math.round(v / 100000)}L`} /><Tooltip formatter={(v) => inr(v)} {...tip} /><Area dataKey="revenue" stroke="#241F1B" strokeWidth={1.5} fill="#D4B895" fillOpacity={0.25} /></AreaChart></ResponsiveContainer></div></Panel>
        <Panel title="Average order value"><div className="dchart"><ResponsiveContainer width="100%" height={240}><LineChart data={m}><CartesianGrid stroke="#e9e1d3" vertical={false} /><XAxis dataKey="month" {...axis} /><YAxis {...axis} width={52} tickFormatter={(v) => `${Math.round(v / 1000)}k`} /><Tooltip formatter={(v) => inr(v)} {...tip} /><Line dataKey="aov" stroke="#B99A70" strokeWidth={2} dot={{ r: 3 }} /></LineChart></ResponsiveContainer></div></Panel>
        <Panel title="Revenue by category"><div className="dchart"><ResponsiveContainer width="100%" height={240}><BarChart data={byCat} layout="vertical" margin={{ left: 20 }}><XAxis type="number" hide /><YAxis dataKey="name" type="category" {...axis} width={80} /><Tooltip formatter={(v) => inr(v)} {...tip} /><Bar dataKey="rev" fill="#241F1B" radius={[0, 2, 2, 0]} /></BarChart></ResponsiveContainer></div></Panel>
        <Panel title="Conversion funnel (sample)"><ul className="dfunnel">{funnel.map((f, i) => <li key={f.name}><span>{f.name}</span><i style={{ width: `${(f.value / funnel[0].value) * 100}%` }} /><b>{f.value.toLocaleString('en-IN')}</b></li>)}</ul></Panel>
        <Panel title="Best sellers" className="dpanel--wide"><table className="dtable"><thead><tr><th>Product</th><th className="r">Units sold</th></tr></thead><tbody>{top.map((t) => <tr key={t.id}><td>{t.name}</td><td className="r">{t.qty}</td></tr>)}</tbody></table></Panel>
      </div>
    </>
  );
}

export function Marketing() {
  const { toast } = useDash();
  const promos = useAsync(() => api.staff.promos(), []); const camps = useAsync(() => api.staff.campaigns(), []);
  if (promos.loading || camps.loading) return <Loading />; if (promos.error) return <Forbidden msg={promos.error.message} />;
  return (
    <>
      <PageHead title="Marketing" sub="Campaigns and promo codes." />
      <div className="dgrid dgrid--2">
        <Panel title="Campaigns"><table className="dtable"><thead><tr><th>Campaign</th><th>Channel</th><th>Status</th><th className="r">Reach</th></tr></thead><tbody>{camps.data.map((c) => <tr key={c.id}><td>{c.name}</td><td>{c.channel}</td><td><Status s={c.status} /></td><td className="r">{c.reach ? c.reach.toLocaleString('en-IN') : '—'}</td></tr>)}</tbody></table></Panel>
        <Panel title="Promo codes"><table className="dtable"><thead><tr><th>Code</th><th>Offer</th><th className="r">Used</th><th className="r">Active</th></tr></thead><tbody>{promos.data.map((p) => <tr key={p.code}><td><b>{p.code}</b></td><td>{p.desc}</td><td className="r">{p.used}</td><td className="r"><button role="switch" aria-checked={p.active} aria-label={`${p.code} active`} className={`dswitch ${p.active ? 'on' : ''}`} onClick={async () => { await api.staff.togglePromo(p.code); toast(`${p.code} ${p.active ? 'paused' : 'activated'}`); promos.reload(); }}><i /></button></td></tr>)}</tbody></table></Panel>
      </div>
    </>
  );
}

export function SettingsPage() {
  const { toast } = useDash();
  const [s, setS] = useState({ name: 'LUMIÈRE Fine Jewellery', gst: 3, ship: 'Free insured shipping', returns: 7 });
  return (
    <>
      <PageHead title="Settings" sub="Store configuration and access control." />
      <div className="dgrid dgrid--2">
        <Panel title="Store"><form className="dform" onSubmit={(e) => { e.preventDefault(); toast('Settings saved (prototype: not persisted)'); }}><label>Store name<input value={s.name} onChange={(e) => setS({ ...s, name: e.target.value })} /></label><label>GST rate (%)<input type="number" value={s.gst} onChange={(e) => setS({ ...s, gst: e.target.value })} /></label><label>Shipping policy<input value={s.ship} onChange={(e) => setS({ ...s, ship: e.target.value })} /></label><label>Return window (days)<input type="number" value={s.returns} onChange={(e) => setS({ ...s, returns: e.target.value })} /></label><div className="dform__act"><button className="dbtn dbtn--dark">Save</button></div></form></Panel>
        <Panel title="Roles and permissions"><div className="dtable-wrap"><table className="dtable dtable--matrix"><thead><tr><th>Permission</th><th>Employee</th><th>Manager</th><th>Admin</th></tr></thead><tbody>{PERMISSIONS.map((p) => <tr key={p}><td>{p}</td>{['EMPLOYEE', 'MANAGER', 'ADMIN'].map((r) => <td key={r}>{ROLES[r].includes(p) ? <Check size={14} /> : ''}</td>)}</tr>)}</tbody></table></div><p className="dnote">Enforced by the API in production. In this prototype the checks run in the browser.</p></Panel>
      </div>
    </>
  );
}

export function Tasks() {
  const { session, toast } = useDash();
  const { data, loading, error, reload } = useAsync(() => api.staff.tasks(), []);
  const orders = useAsync(() => api.staff.orders().catch(() => []), []);
  if (loading) return <Loading />; if (error) return <Forbidden msg={error.message} />;
  const mine = data.filter((t) => t.owner === session.userId || session.role !== 'EMPLOYEE');
  const set = async (t, status) => { await api.staff.updateTask(t.id, { status }); toast(`Task marked ${status.toLowerCase()}`); reload(); };
  const low = PRODUCTS.filter((p) => p.stock <= 3).slice(0, 4);
  const todays = (orders.data || []).filter((o) => ['Processing', 'Packed'].includes(o.status)).slice(0, 5);
  return (
    <>
      <PageHead title="Today’s tasks" sub="Your assigned work." />
      <div className="dgrid dgrid--2-1">
        <Panel title="My tasks"><ul className="dtasks">{mine.map((t) => <li key={t.id} className={t.status === 'Done' ? 'is-done' : ''}><label className="dcheck"><input type="checkbox" checked={t.status === 'Done'} onChange={(e) => set(t, e.target.checked ? 'Done' : 'Pending')} /><span><b>{t.title}</b><em className={`pr pr--${t.priority.toLowerCase()}`}>{t.priority} priority</em></span></label><Status s={t.status} /></li>)}</ul></Panel>
        <div className="dstack">
          <Panel title="Orders to fulfil">{todays.length ? <ul className="dlog">{todays.map((o) => <li key={o.id}><span>{o.number}<em>{o.customer}</em></span><Status s={o.status} /></li>)}</ul> : <p className="dnote">Nothing waiting.</p>}</Panel>
          <Panel title="Inventory alerts"><ul className="dlist">{low.map((p) => <li key={p.id}><img src={productImg(p, 0, 480)} alt="" /><span><b>{p.name}</b><em className="warn">{p.stock} left</em></span></li>)}</ul></Panel>
        </div>
      </div>
    </>
  );
}

export function Support() {
  const { toast } = useDash();
  const { data, loading, error, reload } = useAsync(() => api.staff.tickets(), []);
  const [sel, setSel] = useState(null); const [text, setText] = useState('');
  if (loading) return <Loading />; if (error) return <Forbidden msg={error.message} />;
  const cur = sel && data.find((t) => t.id === sel);
  const send = async (e) => { e.preventDefault(); if (!text.trim()) return; await api.staff.replyTicket(cur.id, text); setText(''); toast('Reply sent (simulated)'); reload(); };
  return (
    <>
      <PageHead title="Customer support" sub="Enquiries from clients." />
      <Panel><ul className="dtickets">{data.map((t) => <li key={t.id}><button onClick={() => setSel(t.id)}><span><b>{t.subject}</b><em>{t.customer} · {dateFmt(t.created, { day: 'numeric', month: 'short' })}</em></span><Status s={t.status} /></button></li>)}</ul></Panel>
      <Side open={!!cur} onClose={() => setSel(null)} title={cur?.subject || ''}>
        {cur && <div className="dorder"><div className="dmsg"><b>{cur.customer}</b><p>{cur.body}</p></div>{cur.replies.map((r, i) => <div key={i} className="dmsg dmsg--out"><b>{r.by}</b><p>{r.text}</p></div>)}<form onSubmit={send} className="dform"><label>Reply<textarea rows="4" value={text} onChange={(e) => setText(e.target.value)} /></label><div className="dform__act"><button className="dbtn dbtn--dark">Send reply</button></div></form></div>}
      </Side>
    </>
  );
}
