import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { load, save } from '../utils/storage';
import { byId } from '../data/products';
import { GST_RATE } from '../utils/format';

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => load('lm_cart', []));
  const [wishlist, setWishlist] = useState(() => load('lm_wishlist', []));
  const [ui, setUi] = useState({ cartOpen: false, searchOpen: false, menuOpen: false, quick: null });
  const [bump, setBump] = useState(0);
  const [promo, setPromo] = useState(null);
  const [live, setLive] = useState('');

  useEffect(() => { save('lm_cart', cart); }, [cart]);
  useEffect(() => { save('lm_wishlist', wishlist); }, [wishlist]);

  const open = useCallback((k, v = true) => setUi((u) => ({ ...u, [k]: v })), []);
  const closeAll = useCallback(() => setUi({ cartOpen: false, searchOpen: false, menuOpen: false, quick: null }), []);

  const addToCart = useCallback((id, size, qty = 1) => {
    const p = byId(id);
    setCart((c) => {
      const key = `${id}:${size || ''}`;
      const ex = c.find((l) => l.key === key);
      if (ex) return c.map((l) => (l.key === key ? { ...l, qty: Math.min(10, l.qty + qty) } : l));
      return [...c, { key, id, size, qty }];
    });
    setBump((b) => b + 1);
    setLive(`${p.name} added to your bag`);
  }, []);
  const setQty = useCallback((key, qty) => setCart((c) => (qty <= 0 ? c.filter((l) => l.key !== key) : c.map((l) => (l.key === key ? { ...l, qty: Math.min(10, qty) } : l)))), []);
  const removeLine = useCallback((key) => setCart((c) => c.filter((l) => l.key !== key)), []);
  const clearCart = useCallback(() => { setCart([]); setPromo(null); }, []);
  const toggleWish = useCallback((id) => {
    setWishlist((w) => { const has = w.includes(id); setLive(has ? 'Removed from wishlist' : 'Saved to wishlist'); return has ? w.filter((x) => x !== id) : [...w, id]; });
  }, []);

  const lines = useMemo(() => cart.map((l) => ({ ...l, product: byId(l.id) })).filter((l) => l.product), [cart]);
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const discount = promo ? Math.round(subtotal * (promo.value / 100)) : 0;
  const gst = Math.round((subtotal - discount) * GST_RATE);
  const total = subtotal - discount + gst;

  const value = { cart, lines, count, subtotal, discount, gst, total, promo, setPromo, wishlist, ui, open, closeAll, bump, live, addToCart, setQty, removeLine, clearCart, toggleWish };
  return <Ctx.Provider value={value}>{children}<div className="sr-only" aria-live="polite" role="status">{live}</div></Ctx.Provider>;
}
