// LUMIÈRE API seam.
// PROTOTYPE ADAPTER: everything below runs in the browser against localStorage.
// It mirrors a REST contract so each function can be replaced by fetch() calls to a server that
// enforces authentication (sessions/JWT) and RBAC middleware. Client-side checks here are for UX only
// and are NOT security. See README.md ("Going to production").
import { load, save } from '../utils/storage';
import { sha } from '../utils/format';
import { can } from '../data/permissions';
import { PRODUCTS, patchProduct } from '../data/products';
import { CUSTOMERS, SEED_ORDERS, STAFF, SEED_TASKS, SEED_TICKETS, PROMOS, CAMPAIGNS } from '../data/seed';

const K = { users: 'lm_users', session: 'lm_session', myOrders: 'lm_orders', orders: 'lm_ops_orders', staff: 'lm_staff', tasks: 'lm_tasks', tickets: 'lm_tickets', stockLog: 'lm_stock_log', promos: 'lm_promos', campaigns: 'lm_campaigns', content: 'lm_content', profile: 'lm_profile_' };
const delay = (v, ms = 120) => new Promise((res) => setTimeout(() => res(v), ms));
const fail = (status, message) => Promise.reject(Object.assign(new Error(message), { status }));

const session = () => { const s = load(K.session, null); return s && s.exp > Date.now() ? s : null; };
const guard = (perm) => {
  const s = session();
  if (!s) return fail(401, 'Please sign in.');
  if (perm && !can(s.role, perm)) return fail(403, 'You do not have permission to do that.');
  return null;
};

async function ensureStaff() {
  let staff = load(K.staff, null);
  if (!staff) {
    staff = [];
    for (const s of STAFF) { const { password, ...rest } = s; staff.push({ ...rest, hash: await sha(password + s.email) }); }
    save(K.staff, staff);
  }
  return staff;
}
const ops = () => load(K.orders, SEED_ORDERS);

export const api = {
  auth: {
    session: () => session(),
    async login({ email, password, staff }) {
      email = (email || '').trim().toLowerCase();
      const h = await sha(password + email);
      let user;
      if (staff) {
        user = (await ensureStaff()).find((s) => s.email === email && s.hash === h);
        if (user && !user.active) return fail(403, 'This staff account is deactivated.');
      } else {
        user = load(K.users, []).find((u) => u.email === email && u.hash === h);
      }
      if (!user) return fail(401, 'Email or password is incorrect.');
      const s = { userId: user.id, name: user.name, email: user.email, role: staff ? user.role : 'CUSTOMER', title: user.title || null, modules: user.modules || null, token: crypto.randomUUID(), exp: Date.now() + 8 * 3600e3 };
      save(K.session, s);
      return delay(s, 350);
    },
    async register({ name, email, password }) {
      email = (email || '').trim().toLowerCase();
      const users = load(K.users, []);
      if (users.some((u) => u.email === email)) return fail(409, 'An account with this email already exists.');
      const user = { id: `U${Date.now()}`, name: name.trim(), email, hash: await sha(password + email), created: new Date().toISOString() };
      save(K.users, [...users, user]);
      return api.auth.login({ email, password, staff: false });
    },
    logout() { localStorage.removeItem(K.session); return Promise.resolve(); },
  },

  orders: {
    mine() { const s = session(); if (!s) return delay([]); return delay(load(K.myOrders, []).filter((o) => o.email === s.email)); },
    byNumber(num) { return delay(load(K.myOrders, []).find((o) => o.number === num) || null); },
    create(payload) {
      const number = `#LMR${Math.floor(30000 + Math.random() * 69999)}`;
      const order = { id: `LMR${Date.now()}`, number, status: 'Processing', placed: new Date().toISOString(), ...payload };
      save(K.myOrders, [order, ...load(K.myOrders, [])]);
      save(K.orders, [{ ...order, customerId: 'WEB', customer: payload.customerName, city: payload.address?.city || '' }, ...ops()]);
      return delay(order, 900);
    },
  },
  profile: {
    get(email) { return load(K.profile + email, { phone: '', prefs: { email: true, sms: false, appointments: true, news: 'new-arrivals' }, addresses: [] }); },
    set(email, v) { return save(K.profile + email, v); },
  },
  newsletter: { subscribe() { return delay(true, 600); } },

  staff: {
    async orders() { const e = guard('orders.view'); if (e) return e; return delay(ops()); },
    async updateOrder(id, patch) {
      const e = guard('orders.update'); if (e) return e;
      const list = ops().map((o) => (o.id === id ? { ...o, ...patch } : o)); save(K.orders, list);
      save(K.myOrders, load(K.myOrders, []).map((o) => (o.id === id ? { ...o, ...patch } : o)));
      return delay(list.find((o) => o.id === id), 200);
    },
    async customers() { const e = guard('customers.view'); if (e) return e; return delay(CUSTOMERS); },
    async products() { const e = guard('products.view'); if (e) return e; return delay(PRODUCTS); },
    async updateProduct(id, patch) { const e = guard('products.update'); if (e) return e; return delay(patchProduct(id, patch), 200); },
    async adjustStock(id, delta, reason) {
      const e = guard('inventory.update'); if (e) return e;
      const p = PRODUCTS.find((x) => x.id === id); const stock = Math.max(0, p.stock + delta);
      patchProduct(id, { stock });
      const s = session();
      save(K.stockLog, [{ at: new Date().toISOString(), id, name: p.name, delta, reason, by: s.name }, ...load(K.stockLog, [])].slice(0, 200));
      return delay(p, 150);
    },
    async stockLog() { const e = guard('inventory.view'); if (e) return e; return delay(load(K.stockLog, [])); },
    async employees() { const e = guard('employees.view'); if (e) return e; return delay((await ensureStaff()).map(({ hash, ...s }) => s)); },
    async updateEmployee(id, patch) {
      const e = guard('employees.manage'); if (e) return e;
      save(K.staff, (await ensureStaff()).map((s) => (s.id === id ? { ...s, ...patch } : s)));
      return delay(true, 150);
    },
    async tasks() { const e = guard('tasks.view'); if (e) return e; return delay(load(K.tasks, SEED_TASKS)); },
    async updateTask(id, patch) { const e = guard('tasks.view'); if (e) return e; save(K.tasks, load(K.tasks, SEED_TASKS).map((t) => (t.id === id ? { ...t, ...patch } : t))); return delay(true, 80); },
    async tickets() { const e = guard('support.respond'); if (e) return e; return delay(load(K.tickets, SEED_TICKETS)); },
    async replyTicket(id, text) {
      const e = guard('support.respond'); if (e) return e; const s = session();
      const list = load(K.tickets, SEED_TICKETS).map((t) => (t.id === id ? { ...t, status: 'Answered', replies: [...t.replies, { by: s.name, text, at: new Date().toISOString() }] } : t));
      save(K.tickets, list); return delay(list.find((t) => t.id === id), 200);
    },
    async promos() { const e = guard('marketing.manage'); if (e) return e; return delay(load(K.promos, PROMOS)); },
    async togglePromo(code) { const e = guard('marketing.manage'); if (e) return e; save(K.promos, load(K.promos, PROMOS).map((p) => (p.code === code ? { ...p, active: !p.active } : p))); return delay(true, 60); },
    async campaigns() { const e = guard('marketing.manage'); if (e) return e; return delay(load(K.campaigns, CAMPAIGNS)); },
    async content() { const e = guard('content.manage'); if (e) return e; return delay(load(K.content, { announcement: 'Complimentary insured shipping on every order.', heroEyebrow: 'FINE JEWELLERY', featuredCollection: 'bridal' })); },
    async saveContent(v) { const e = guard('content.manage'); if (e) return e; return delay(save(K.content, v), 250); },
  },
};
export const promoLookup = (code) => load(K.promos, PROMOS).find((p) => p.code === code.trim().toUpperCase() && p.active);
