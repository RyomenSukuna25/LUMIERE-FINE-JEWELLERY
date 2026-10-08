import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Heart, User, ShoppingBag, Menu, UserRound, Package, LogIn, LogOut, Shield } from 'lucide-react';
import Logo from './Logo';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

const NAV = [['/', 'Home'], ['/collections', 'Collections'], ['/shop', 'Jewellery'], ['/about', 'About'], ['/journal', 'Journal']];

export default function Header({ introDone = true }) {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const { count, bump, wishlist, open } = useStore();
  const { session, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [acct, setAcct] = useState(false);
  const wrap = useRef(null);
  const last = useRef(0);
  const home = pathname === '/';

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 520 && y > last.current + 4 ? true : y < last.current - 4 ? false : hidden);
      last.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [hidden]);
  useEffect(() => { setAcct(false); }, [pathname]);
  useEffect(() => {
    if (!acct) return undefined;
    const onDoc = (e) => { if (!wrap.current?.contains(e.target)) setAcct(false); };
    const onKey = (e) => { if (e.key === 'Escape') setAcct(false); };
    document.addEventListener('mousedown', onDoc); document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [acct]);

  const tone = home && !scrolled ? 'dark' : home ? 'glass' : 'light';
  return (
    <header className={`hdr hdr--${tone} ${hidden ? 'is-hidden' : ''} ${introDone ? 'is-ready' : ''}`}>
      <div className="hdr__in">
        <button className="icon-btn hdr__menu" aria-label="Open menu" onClick={() => open('menuOpen', true)}><Menu size={22} strokeWidth={1.4} /></button>
        <Link to="/" className="hdr__logo" aria-label="LUMIÈRE home"><Logo /></Link>
        <nav className="hdr__nav" aria-label="Primary">
          {NAV.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'is-active' : '')}>{label}</NavLink>
          ))}
        </nav>
        <div className="hdr__tools">
          <button className="icon-btn" aria-label="Search" onClick={() => open('searchOpen', true)}><Search size={20} strokeWidth={1.4} /></button>
          <Link to="/account/wishlist" className="icon-btn hdr__heart" aria-label={`Wishlist, ${wishlist.length} saved`}>
            <Heart size={20} strokeWidth={1.4} />{wishlist.length > 0 && <i className="dot" aria-hidden="true" />}
          </Link>
          <div className="hdr__acct" ref={wrap}>
            <button className="icon-btn" aria-label="Account menu" aria-haspopup="menu" aria-expanded={acct} onClick={() => setAcct((a) => !a)}>
              <User size={20} strokeWidth={1.4} />
            </button>
            <AnimatePresence>
              {acct && (
                <motion.div className="menu-pop" role="menu" initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}>
                  {session && <p className="menu-pop__hello">Signed in as <strong>{session.name}</strong></p>}
                  <Link role="menuitem" to="/account"><UserRound size={17} strokeWidth={1.4} />My Account</Link>
                  <Link role="menuitem" to="/account/orders"><Package size={17} strokeWidth={1.4} />My Orders</Link>
                  <Link role="menuitem" to="/account/wishlist"><Heart size={17} strokeWidth={1.4} />Wishlist</Link>
                  {session ? (
                    <button role="menuitem" onClick={async () => { await logout(); setAcct(false); nav('/'); }}><LogOut size={17} strokeWidth={1.4} />Sign out</button>
                  ) : (
                    <Link role="menuitem" to="/signin"><LogIn size={17} strokeWidth={1.4} />Sign In / Register</Link>
                  )}
                  <hr />
                  <Link role="menuitem" to={session && session.role !== 'CUSTOMER' ? '/staff' : '/staff/login'} className="menu-pop__staff"><Shield size={17} strokeWidth={1.4} />Staff Access</Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button className="icon-btn hdr__bag" data-cart-icon aria-label={`Bag, ${count} items`} onClick={() => open('cartOpen', true)}>
            <ShoppingBag size={20} strokeWidth={1.4} />
            {count > 0 && <motion.i key={bump} className="count" initial={{ scale: 0.4 }} animate={{ scale: [1.5, 1] }} transition={{ duration: 0.4 }}>{count}</motion.i>}
          </button>
        </div>
      </div>
    </header>
  );
}
