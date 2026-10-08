import { PRODUCTS } from './products';

function rng(seed) { let a = seed; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const r = rng(20261007);
const pick = (a) => a[Math.floor(r() * a.length)];

const FIRST = ['Aarav', 'Ishita', 'Rohan', 'Meera', 'Kabir', 'Ananya', 'Vihaan', 'Diya', 'Arjun', 'Saanvi', 'Neil', 'Tara', 'Dev', 'Riya', 'Karan', 'Naina', 'Yash', 'Pooja', 'Aditya', 'Sneha', 'Rahul', 'Kriti', 'Manav', 'Avni'];
const LAST = ['Mehta', 'Shah', 'Patel', 'Reddy', 'Kapoor', 'Iyer', 'Nair', 'Singh', 'Desai', 'Joshi', 'Malhotra', 'Bhatia', 'Chopra', 'Gupta', 'Menon', 'Rao'];
const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Pune', 'Hyderabad', 'Chennai', 'Ahmedabad', 'Kolkata', 'Jaipur', 'Surat'];

export const CUSTOMERS = Array.from({ length: 64 }, (_, i) => {
  const first = FIRST[i % FIRST.length], last = LAST[(i * 5 + 3) % LAST.length];
  return {
    id: `C${2001 + i}`, name: `${first} ${last}`, email: `${first}.${last}`.toLowerCase() + '@example.com',
    city: pick(CITIES), joined: new Date(2025, 9 + Math.floor(r() * 12), 1 + Math.floor(r() * 27)).toISOString(),
    tier: r() > 0.85 ? 'Private client' : r() > 0.55 ? 'Returning' : 'New',
  };
});

const STATUSES = ['Processing', 'Packed', 'Shipped', 'Delivered', 'Delivered', 'Delivered', 'Cancelled'];
const now = new Date('2026-10-07T10:00:00+05:30').getTime();
export const SEED_ORDERS = Array.from({ length: 132 }, (_, i) => {
  const cust = CUSTOMERS[Math.floor(r() * CUSTOMERS.length)];
  const nItems = r() > 0.72 ? 2 : r() > 0.94 ? 3 : 1;
  const items = Array.from({ length: nItems }, () => { const p = pick(PRODUCTS); return { id: p.id, name: p.name, price: p.price, qty: 1, size: p.sizes[0] }; });
  const subtotal = items.reduce((s, x) => s + x.price * x.qty, 0);
  const days = Math.floor(Math.pow(r(), 1.4) * 180);
  const placed = new Date(now - days * 86400000 - Math.floor(r() * 80000000));
  let status = pick(STATUSES);
  if (days < 2) status = pick(['Processing', 'Packed']);
  else if (days < 6 && status === 'Delivered') status = 'Shipped';
  const total = Math.round(subtotal * 1.03);
  return {
    id: `LMR${10600 - i}`, number: `#${10482 + 132 - i}`.replace('#1', '#1'), customerId: cust.id, customer: cust.name, email: cust.email, city: cust.city,
    items, subtotal, gst: total - subtotal, shipping: 0, total, status, placed: placed.toISOString(),
    payment: pick(['Card', 'UPI', 'UPI', 'Net banking']), assignedTo: status === 'Processing' || status === 'Packed' ? pick(['E3001', 'E3002']) : null,
  };
}).sort((a, b) => new Date(b.placed) - new Date(a.placed)).map((o, i) => ({ ...o, number: `#${10482 + (131 - i)}` }));

export const STAFF = [
  { id: 'E1001', name: 'Arjun Mehta', email: 'admin@lumiere.in', password: 'lumiere-admin', role: 'ADMIN', title: 'Director', active: true, modules: null },
  { id: 'M2001', name: 'Priya Nair', email: 'manager@lumiere.in', password: 'lumiere-manager', role: 'MANAGER', title: 'Operations manager', active: true, modules: null },
  { id: 'E3001', name: 'Rahul Verma', email: 'employee@lumiere.in', password: 'lumiere-employee', role: 'EMPLOYEE', title: 'Fulfilment associate', active: true, modules: ['tasks', 'orders', 'inventory', 'support'] },
  { id: 'E3002', name: 'Sana Qureshi', email: 'sana@lumiere.in', password: 'lumiere-employee', role: 'EMPLOYEE', title: 'Client advisor', active: true, modules: ['tasks', 'orders', 'support'] },
  { id: 'M2002', name: 'Dev Kulkarni', email: 'dev@lumiere.in', password: 'lumiere-manager', role: 'MANAGER', title: 'Merchandising manager', active: true, modules: null },
  { id: 'E3003', name: 'Nisha Bhatt', email: 'nisha@lumiere.in', password: 'lumiere-employee', role: 'EMPLOYEE', title: 'Inventory associate', active: false, modules: ['tasks', 'inventory'] },
];

export const SEED_TASKS = [
  { id: 'T1', title: 'Prepare order #10609 for packaging', priority: 'High', status: 'Pending', owner: 'E3001', module: 'orders' },
  { id: 'T2', title: 'Check inventory for rings, shelf A', priority: 'Medium', status: 'Pending', owner: 'E3001', module: 'inventory' },
  { id: 'T3', title: 'Update product images for the new collection', priority: 'Medium', status: 'In progress', owner: 'E3001', module: 'products' },
  { id: 'T4', title: 'Answer customer enquiries queued overnight', priority: 'Low', status: 'Pending', owner: 'E3001', module: 'support' },
  { id: 'T5', title: 'Book a private viewing for Saturday', priority: 'High', status: 'Pending', owner: 'E3002', module: 'support' },
  { id: 'T6', title: 'Quality check on the Aanya Bridal Collar', priority: 'High', status: 'In progress', owner: 'E3002', module: 'orders' },
];

export const SEED_TICKETS = [
  { id: 'S501', customer: 'Ishita Shah', subject: 'Ring size exchange', body: 'I ordered the Celeste ring in size 14 and would like to try 16 instead. Is an exchange possible?', status: 'Open', created: '2026-10-06T09:12:00+05:30', replies: [] },
  { id: 'S502', customer: 'Kabir Malhotra', subject: 'Delivery to a different address', body: 'Can I change the delivery address for my order? I will be travelling next week.', status: 'Open', created: '2026-10-06T16:40:00+05:30', replies: [] },
  { id: 'S503', customer: 'Meera Iyer', subject: 'Care for pearl earrings', body: 'How should I clean and store my pearl drop earrings?', status: 'Answered', created: '2026-10-04T11:05:00+05:30', replies: [{ by: 'Sana Qureshi', text: 'Wipe with a soft dry cloth after wearing and store them separately in the pouch. Please avoid perfume and water.', at: '2026-10-04T14:20:00+05:30' }] },
  { id: 'S504', customer: 'Arjun Reddy', subject: 'Gift packaging', body: 'Could the order be sent in gift packaging with a handwritten note?', status: 'Open', created: '2026-10-07T08:02:00+05:30', replies: [] },
];

export const PROMOS = [
  { code: 'WELCOME10', desc: '10% off the first order', type: 'percent', value: 10, active: true, used: 142 },
  { code: 'FESTIVE5', desc: '5% off during the festive season', type: 'percent', value: 5, active: true, used: 61 },
  { code: 'BRIDAL15', desc: 'Private bridal appointments', type: 'percent', value: 15, active: false, used: 9 },
];
export const CAMPAIGNS = [
  { id: 'K1', name: 'Festive collection preview', channel: 'Email', status: 'Scheduled', date: '2026-10-14', reach: 8420 },
  { id: 'K2', name: 'New arrivals: sapphire and emerald', channel: 'Email', status: 'Sent', date: '2026-09-28', reach: 8110, openRate: 46 },
  { id: 'K3', name: 'Bridal appointments', channel: 'Instagram', status: 'Live', date: '2026-09-20', reach: 24600 },
  { id: 'K4', name: 'Care guide for gold jewellery', channel: 'Journal', status: 'Draft', date: '2026-10-20', reach: 0 },
];

export const monthly = (orders) => {
  const keys = []; const d = new Date('2026-10-01');
  for (let i = 5; i >= 0; i--) { const x = new Date(d.getFullYear(), d.getMonth() - i, 1); keys.push({ key: `${x.getFullYear()}-${x.getMonth()}`, label: x.toLocaleString('en-IN', { month: 'short' }) }); }
  return keys.map((k) => {
    const list = orders.filter((o) => { const x = new Date(o.placed); return `${x.getFullYear()}-${x.getMonth()}` === k.key && o.status !== 'Cancelled'; });
    return { month: k.label, revenue: list.reduce((s, o) => s + o.total, 0), orders: list.length };
  });
};
