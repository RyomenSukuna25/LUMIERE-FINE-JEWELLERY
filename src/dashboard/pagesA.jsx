import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Search, Plus, Minus } from 'lucide-react';
import { api } from '../api';
import { useAsync, Status, Panel, PageHead, Side, Modal, Loading, Forbidden } from './ui';
import { useDash } from './DashboardApp';
import { PRODUCTS, productImg, CATEGORIES } from '../data/products';
import { monthly } from '../data/seed';
import { inr, inrCompact, dateFmt } from '../utils/format';

const TONES = ['#241F1B', '#B99A70', '#D4B895', '#8c7048', '#6b6157', '#c9b79c'];
const axis = { stroke: '#a39a8d', fontSize: 11, tickLine: false, axisLine: false };
export const ORDER_STATUSES = ['Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

export function Overview() {
  const { session } = useDash();
  const orders = useAsync(() => api.staff.orders(), []);
  const customers = useAsync(() => api.staff.customers().catch(() => []), []);
  if (orders.loading) return <Loading />;
  if (orders.error) return <Forbidden msg={orders.error.message} />;
  const list = orders.data; const live = list.filter((o) => o.status !== 'Cancelled');
  const revenue = live.reduce((s, o) => s + o.total, 0);
  const aov = live.length ? revenue / live.length : 0;
  const series = monthly(list);
  const cat = CATEGORIES.map((c) => ({ name: c, value: live.reduce((s, o) => s + o.items.filter((i) => PRODUCTS.find((p) => p.id === i.id)?.category === c).reduce((a, i) => a + i.price * i.qty, 0), 0) })).filter((x) => x.value > 0);
  const low = PRODUCTS.filter((p) => p.stock <= 4).sort((a, b) => a.stock - b.stock).slice(0, 5);
  const top = Object.values(live.flatMap((o) => o.items).reduce((m, i) => { m[i.id] = m[i.id] || { ...i, qty: 0, rev: 0 }; m[i.id].qty += i.qty; m[i.id].rev += i.price * i.qty; return m; }, {})).sort((a, b) => b.rev - a.rev).slice(0, 5);
  const open = list.filter((o) => ['Processing', 'Packed'].includes(o.status)).length;
  return (
    <>
      <PageHead title="Overview" sub={`${session.role === 'MANAGER' ? 'Operations summary' : 'Welcome back'}, ${session.name.split(' ')[0]}.`} />
      <div className="dstats">
        <div><span>Revenue</span><b>{inrCompact(revenue)}</b><em>{live.length} paid orders</em></div>
        <div><span>Orders</span><b>{list.length}</b><em>{open} to fulfil</em></div>
        <div><span>Average order</span><b>{inr(aov)}</b><em>excl. cancelled</em></div>
        <div><span>Customers</span><b>{(customers.data || []).length || '—'}</b><em>on record</em></div>
        <div><span>Stock alerts</span><b>{PRODUCTS.filter((p) => p.stock <= 3).length}</b><em>3 or fewer left</em></div>
      </div>
      <div className="dgrid dgrid--2-1">
        <Panel title="Sales, last 6 months">
          <div className="dchart"><ResponsiveContainer width="100%" height={260}><AreaChart data={series} margin={{ left: 0, right: 8, top: 8 }}><CartesianGrid stroke="#e9e1d3" vertical={false} /><XAxis dataKey="month" {...axis} /><YAxis {...axis} width={52} tickFormatter={(v) => `${Math.round(v / 100000)}L`} /><Tooltip formatter={(v) => inr(v)} contentStyle={{ border: '1px solid #e0d6c5', borderRadius: 4, fontSize: 12 }} /><Area type="monotone" dataKey="revenue" stroke="#241F1B" strokeWidth={1.5} fill="#D4B895" fillOpacity={0.25} isAnimationActive animationDuration={900} /></AreaChart></ResponsiveContainer></div>
        </Panel>
        <Panel title="Sales by category">
          <div className="dchart dchart--pie"><ResponsiveContainer width="100%" height={180}><PieChart><Pie data={cat} dataKey="value" innerRadius={52} outerRadius={80} paddingAngle={1} animationDuration={900}>{cat.map((_, i) => <Cell key={i} fill={TONES[i % TONES.length]} />)}</Pie><Tooltip formatter={(v) => inr(v)} /></PieChart></ResponsiveContainer>
            <ul className="dlegend">{cat.map((c, i) => <li key={c.name}><i style={{ background: TONES[i % TONES.length] }} />{c.name}<b>{Math.round((c.value / cat.reduce((s, x) => s + x.value, 0)) * 100)}%</b></li>)}</ul></div>
        </Panel>
      </div>
      <div className="dgrid dgrid--2-1">
        <Panel title="Recent orders" action={<Link to="/staff/orders" className="dlink">View all</Link>}>
          <div className="dtable-wrap"><table className="dtable"><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th className="r">Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>{list.slice(0, 6).map((o) => <tr key={o.id}><td>{o.number}</td><td>{o.customer}</td><td>{o.items.length}</td><td className="r">{inr(o.total)}</td><td><Status s={o.status} /></td><td>{dateFmt(o.placed, { day: '2-digit', month: 'short' })}</td></tr>)}</tbody></table></div>
        </Panel>
        <Panel title="Inventory alerts" action={<Link to="/staff/inventory" className="dlink">Manage</Link>}>
          <ul className="dlist">{low.map((p) => <li key={p.id}><img src={productImg(p, 0, 480)} alt="" /><span><b>{p.name}</b><em className={p.stock <= 2 ? 'warn' : ''}>{p.stock} left</em></span></li>)}</ul>
        </Panel>
      </div>
      <div className="dgrid dgrid--2-1">
        <Panel title="Top products"><table className="dtable"><thead><tr><th>Product</th><th className="r">Units</th><th className="r">Revenue</th></tr></thead><tbody>{top.map((t) => <tr key={t.id}><td>{t.name}</td><td className="r">{t.qty}</td><td className="r">{inr(t.rev)}</td></tr>)}</tbody></table></Panel>
        <Panel title="Orders per month"><div className="dchart"><ResponsiveContainer width="100%" height={180}><BarChart data={series}><XAxis dataKey="month" {...axis} /><Tooltip contentStyle={{ border: '1px solid #e0d6c5', borderRadius: 4, fontSize: 12 }} /><Bar dataKey="orders" fill="#B99A70" radius={[2, 2, 0, 0]} animationDuration={900} /></BarChart></ResponsiveContainer></div></Panel>
      </div>
    </>
  );
}

export function Orders() {
  const { can, toast } = useDash();
  const { data, loading, error, reload } = useAsync(() => api.staff.orders(), []);
  const [tab, setTab] = useState('All'); const [q, setQ] = useState(''); const [sel, setSel] = useState(null);
  if (loading) return <Loading />; if (error) return <Forbidden msg={error.message} />;
  const counts = Object.fromEntries(ORDER_STATUSES.map((s) => [s, data.filter((o) => o.status === s).length]));
  const rows = data.filter((o) => (tab === 'All' || o.status === tab) && (!q || `${o.number} ${o.customer} ${o.email}`.toLowerCase().includes(q.toLowerCase())));
  const current = sel && data.find((o) => o.id === sel);
  const setStatus = async (o, status) => { await api.staff.updateOrder(o.id, { status }); toast(`${o.number} marked ${status}`); reload(); };
  return (
    <>
      <PageHead title="Orders" sub="Manage and track all orders."><label className="dsearch"><Search size={15} /><span className="sr-only">Search orders</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search orders" /></label></PageHead>
      <div className="dtabs" role="tablist">{['All', ...ORDER_STATUSES].map((s) => <button key={s} role="tab" aria-selected={tab === s} className={tab === s ? 'is-on' : ''} onClick={() => setTab(s)}>{s} <span>{s === 'All' ? data.length : counts[s]}</span></button>)}</div>
      <Panel><div className="dtable-wrap"><table className="dtable dtable--hover dtable--cards"><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th className="r">Amount</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>{rows.slice(0, 60).map((o) => <tr key={o.id} tabIndex={0} onClick={() => setSel(o.id)} onKeyDown={(e) => e.key === 'Enter' && setSel(o.id)}>
          <td data-l="Order">{o.number}</td><td data-l="Customer">{o.customer}</td><td data-l="Items">{o.items.length}</td><td data-l="Amount" className="r">{inr(o.total)}</td><td data-l="Status"><Status s={o.status} /></td><td data-l="Date">{dateFmt(o.placed)}</td></tr>)}</tbody></table>
        {!rows.length && <p className="dempty">No orders match.</p>}</div></Panel>
      <Side open={!!current} onClose={() => setSel(null)} title={current ? `Order ${current.number}` : ''}>
        {current && (<div className="dorder">
          <div className="dkv"><span>Status</span><Status s={current.status} /></div>
          <div className="dkv"><span>Customer</span><b>{current.customer}</b></div><div className="dkv"><span>Email</span>{current.email}</div><div className="dkv"><span>City</span>{current.city || '—'}</div>
          <div className="dkv"><span>Placed</span>{dateFmt(current.placed, { day: 'numeric', month: 'long', year: 'numeric' })}</div><div className="dkv"><span>Payment</span>{current.payment?.method || current.payment}</div>
          <h3>Items</h3>{current.items.map((it, i) => { const p = PRODUCTS.find((x) => x.id === it.id); return <div className="dline" key={i}>{p && <img src={productImg(p, 0, 480)} alt="" />}<span><b>{it.name}</b><em>Qty {it.qty}{it.size && it.size !== 'One size' ? ` · Size ${it.size}` : ''}</em></span><b>{inr(it.price * it.qty)}</b></div>; })}
          <div className="dkv dkv--total"><span>Total (incl. GST)</span><b>{inr(current.total)}</b></div>
          {can('orders.update') ? (<><h3>Update status</h3><div className="dseg">{ORDER_STATUSES.map((s) => <button key={s} className={current.status === s ? 'is-on' : ''} onClick={() => setStatus(current, s)}>{s}</button>)}</div></>) : <p className="dnote">You can view orders but not change them.</p>}
        </div>)}
      </Side>
    </>
  );
}

export function Products() {
  const { can, toast } = useDash();
  const { data, loading, error, reload } = useAsync(() => api.staff.products(), []);
  const [q, setQ] = useState(''); const [cat, setCat] = useState(''); const [edit, setEdit] = useState(null);
  if (loading) return <Loading />; if (error) return <Forbidden msg={error.message} />;
  const rows = data.filter((p) => (!cat || p.category === cat) && (!q || `${p.name} ${p.id}`.toLowerCase().includes(q.toLowerCase())));
  const save = async (e) => { e.preventDefault(); const f = new FormData(e.target); await api.staff.updateProduct(edit.id, { price: Number(f.get('price')), stock: Number(f.get('stock')), featured: f.get('featured') === 'on' }); toast(`${edit.name} updated`); setEdit(null); reload(); };
  return (
    <>
      <PageHead title="Products" sub={`${data.length} products in the catalogue.`}>
        <label className="dsearch"><Search size={15} /><span className="sr-only">Search products</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" /></label>
        <select className="dselect" aria-label="Category" value={cat} onChange={(e) => setCat(e.target.value)}><option value="">All categories</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        {can('products.create') && <button className="dbtn dbtn--dark" onClick={() => toast('Creating products is handled by the catalogue API in production.')}><Plus size={15} />New product</button>}
      </PageHead>
      <Panel><div className="dtable-wrap"><table className="dtable dtable--hover dtable--cards"><thead><tr><th>Product</th><th>Category</th><th>Material</th><th className="r">Price</th><th className="r">Stock</th><th>Status</th></tr></thead>
        <tbody>{rows.map((p) => <tr key={p.id} tabIndex={0} onClick={() => can('products.update') && setEdit(p)} onKeyDown={(e) => e.key === 'Enter' && can('products.update') && setEdit(p)}>
          <td data-l="Product"><span className="dprod"><img src={productImg(p, 0, 480)} alt="" /><span><b>{p.name}</b><em>{p.id}</em></span></span></td><td data-l="Category">{p.category}</td><td data-l="Material">{p.material}</td><td data-l="Price" className="r">{inr(p.price)}</td><td data-l="Stock" className="r">{p.stock}</td><td data-l="Status"><Status s={p.availability === 'in-stock' ? 'In stock' : p.availability === 'low-stock' ? 'Low stock' : 'Out of stock'} /></td></tr>)}</tbody></table></div></Panel>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit ? `Edit ${edit.name}` : ''}>
        {edit && <form onSubmit={save} className="dform"><label>Price (₹)<input name="price" type="number" min="0" defaultValue={edit.price} required /></label><label>Stock<input name="stock" type="number" min="0" defaultValue={edit.stock} required /></label><label className="dcheck"><input name="featured" type="checkbox" defaultChecked={edit.featured} />Featured on storefront</label><div className="dform__act"><button type="button" className="dbtn" onClick={() => setEdit(null)}>Cancel</button><button className="dbtn dbtn--dark">Save changes</button></div></form>}
      </Modal>
    </>
  );
}

export function Inventory() {
  const { can, toast } = useDash();
  const { data, loading, error, reload } = useAsync(() => api.staff.products(), []);
  const log = useAsync(() => api.staff.stockLog(), []);
  const [only, setOnly] = useState(false);
  if (loading) return <Loading />; if (error) return <Forbidden msg={error.message} />;
  const rows = [...data].sort((a, b) => a.stock - b.stock).filter((p) => !only || p.stock <= 4);
  const adj = async (p, d) => { await api.staff.adjustStock(p.id, d, d > 0 ? 'Stock received' : 'Stock removed'); toast(`${p.name}: ${d > 0 ? '+' : ''}${d}`); reload(); log.reload(); };
  return (
    <>
      <PageHead title="Inventory" sub="Stock levels and movement."><label className="dcheck"><input type="checkbox" checked={only} onChange={(e) => setOnly(e.target.checked)} />Low stock only</label></PageHead>
      <div className="dgrid dgrid--2-1">
        <Panel title="Stock levels"><div className="dtable-wrap"><table className="dtable dtable--cards"><thead><tr><th>Product</th><th>Code</th><th className="r">On hand</th><th>Status</th>{can('inventory.update') && <th className="r">Adjust</th>}</tr></thead>
          <tbody>{rows.map((p) => <tr key={p.id}><td data-l="Product"><span className="dprod"><img src={productImg(p, 0, 480)} alt="" /><b>{p.name}</b></span></td><td data-l="Code">{p.id}</td><td data-l="On hand" className={`r ${p.stock <= 3 ? 'warn' : ''}`}>{p.stock}</td><td data-l="Status"><Status s={p.availability === 'in-stock' ? 'In stock' : p.availability === 'low-stock' ? 'Low stock' : 'Out of stock'} /></td>
            {can('inventory.update') && <td data-l="Adjust" className="r"><span className="dstep"><button aria-label={`Remove one ${p.name}`} onClick={() => adj(p, -1)}><Minus size={13} /></button><button aria-label={`Add one ${p.name}`} onClick={() => adj(p, 1)}><Plus size={13} /></button></span></td>}</tr>)}</tbody></table></div></Panel>
        <Panel title="Recent movement">{(log.data || []).length ? <ul className="dlog">{log.data.slice(0, 14).map((l, i) => <li key={i}><b className={l.delta > 0 ? 'up' : 'down'}>{l.delta > 0 ? '+' : ''}{l.delta}</b><span>{l.name}<em>{l.reason} · {l.by}</em></span></li>)}</ul> : <p className="dnote">No adjustments yet. Changes you make here are logged.</p>}</Panel>
      </div>
    </>
  );
}
