import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, ListTodo, ClipboardList, Gem, Boxes, Users, LifeBuoy, UserCog, LayoutGrid, FileText, BarChart3, Megaphone, Settings as Cog, Menu, LogOut, Bell, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LotusMark } from '../components/Logo';
import { modulesFor, can, ROLE_LABEL } from '../data/permissions';
import { Toasts, Forbidden } from './ui';
import * as A from './pagesA';
import * as B from './pagesB';

const ICON = { overview: LayoutDashboard, tasks: ListTodo, orders: ClipboardList, products: Gem, inventory: Boxes, customers: Users, support: LifeBuoy, employees: UserCog, collections: LayoutGrid, content: FileText, analytics: BarChart3, marketing: Megaphone, settings: Cog };
const DashCtx = createContext(null);
export const useDash = () => useContext(DashCtx);

export default function DashboardApp() {
  const { session, logout, isStaff } = useAuth();
  const loc = useLocation(); const nav = useNavigate();
  const [drawer, setDrawer] = useState(false); const [toasts, setToasts] = useState([]);
  const toast = useCallback((text) => { const id = Date.now() + Math.random(); setToasts((t) => [...t, { id, text }]); setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200); }, []);
  useEffect(() => { setDrawer(false); }, [loc.pathname]);
  useEffect(() => { document.title = 'LUMIÈRE Staff'; return () => { document.title = 'LUMIÈRE Fine Jewellery'; }; }, []);
  const mods = useMemo(() => (session ? modulesFor(session.role, session.modules) : []), [session]);
  if (!session || !isStaff) return <Navigate to="/staff/login" replace />;
  const can_ = (p) => can(session.role, p);
  const home = mods[0]?.path || '/staff';
  const route = (key, el, perm) => <Route path={key} element={mods.some((m) => m.key === key) || key === '' ? el : <Forbidden />} />;
  return (
    <DashCtx.Provider value={{ session, can: can_, toast }}>
      <div className="dash">
        <a className="skip" href="#dmain">Skip to content</a>
        <aside className={`dside-nav ${drawer ? 'is-open' : ''}`} aria-label="Staff navigation">
          <Link to={home} className="dlogo"><LotusMark size={26} /><span>LUMIÈRE</span></Link>
          <nav>{mods.map((m) => { const I = ICON[m.key]; return <NavLink key={m.key} to={m.path} end={m.path === '/staff'} className={({ isActive }) => (isActive ? 'is-on' : '')}><I size={17} strokeWidth={1.5} />{m.label}</NavLink>; })}</nav>
          <div className="dside-nav__ft"><Link to="/" target="_blank"><ExternalLink size={15} />View storefront</Link><button onClick={async () => { await logout(); nav('/staff/login'); }}><LogOut size={15} />Sign out</button></div>
        </aside>
        {drawer && <div className="dnav-scrim" onClick={() => setDrawer(false)} />}
        <div className="dcol">
          <header className="dtop">
            <button className="dbtn dbtn--ghost dtop__menu" aria-label="Open navigation" onClick={() => setDrawer(true)}><Menu size={20} /></button>
            <div className="dtop__title"><b>{session.name}</b><span>{session.title || ROLE_LABEL[session.role]} · {ROLE_LABEL[session.role]}</span></div>
            <button className="dbtn dbtn--ghost" aria-label="Notifications"><Bell size={18} /></button>
          </header>
          <main id="dmain" className="dmain">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={loc.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                <Routes location={loc}>
                  <Route index element={session.role === 'EMPLOYEE' ? <Navigate to={home} replace /> : <A.Overview />} />
                  {route('tasks', <B.Tasks />)}{route('orders', <A.Orders />)}{route('products', <A.Products />)}{route('inventory', <A.Inventory />)}
                  {route('customers', <B.Customers />)}{route('support', <B.Support />)}{route('employees', <B.Employees />)}{route('collections', <B.CollectionsAdmin />)}
                  {route('content', <B.Content />)}{route('analytics', <B.Analytics />)}{route('marketing', <B.Marketing />)}{route('settings', <B.SettingsPage />)}
                  <Route path="*" element={<Forbidden msg="This page does not exist." />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
        <Toasts items={toasts} />
      </div>
    </DashCtx.Provider>
  );
}
