// LUMIÈRE prototype API — Express + JWT + role-based access control.
// Data lives in memory (seeded from src/data/seed.js). Swap the `db` object for SQLite/Postgres in production.
import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { USERS, DEMO_PASSWORD, orders, inventory, customers, employees, tasks, tickets, campaigns, discountCodes, salesByMonth } from '../src/data/seed.js'
import { products } from '../src/data/products.js'
import { ROLE_PERMISSIONS } from '../src/data/rbac.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 4000
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-change-me'   // set a real secret in production

const hash = bcrypt.hashSync(DEMO_PASSWORD, 10)
const accounts = USERS.map((u) => ({ ...u, passwordHash: hash }))
const db = {
  orders: [...orders],
  inventory: inventory.map((i) => ({ ...i })),
  products: products.map((p) => ({ id: p.id, name: p.name, category: p.category, price: p.price, status: 'Active', image: p.images[0], material: p.material })),
  customers, employees, tasks: tasks.map((t) => ({ ...t })), tickets, campaigns, discountCodes,
}

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

const publicUser = ({ passwordHash, ...u }) => u
const sign = (u) => jwt.sign({ sub: u.id, role: u.role }, JWT_SECRET, { expiresIn: '8h' })

// ---- auth middleware
function auth(req, res, next) {
  const h = req.headers.authorization || ''
  if (!h.startsWith('Bearer ')) return res.status(401).json({ error: 'Sign in required.' })
  try {
    const p = jwt.verify(h.slice(7), JWT_SECRET)
    const u = accounts.find((a) => a.id === p.sub)
    if (!u) return res.status(401).json({ error: 'Account not found.' })
    req.user = u; next()
  } catch { res.status(401).json({ error: 'Session expired. Sign in again.' }) }
}
// ---- RBAC middleware: the real security boundary
const requirePermission = (perm) => (req, res, next) =>
  (ROLE_PERMISSIONS[req.user.role] || []).includes(perm) ? next() : res.status(403).json({ error: `Missing permission: ${perm}` })

app.post('/api/auth/login', (req, res) => {
  const { email = '', password = '', portal = 'customer' } = req.body || {}
  const u = accounts.find((a) => a.email === String(email).trim().toLowerCase())
  if (!u || !bcrypt.compareSync(String(password), u.passwordHash)) return res.status(401).json({ error: 'Email or password is incorrect.' })
  if (portal === 'staff' && u.role === 'CUSTOMER') return res.status(403).json({ error: 'This account does not have staff access.' })
  if (portal === 'customer' && u.role !== 'CUSTOMER') return res.status(403).json({ error: 'Staff accounts sign in through Staff Access.' })
  res.json({ token: sign(u), user: publicUser(u), permissions: ROLE_PERMISSIONS[u.role] })
})
app.get('/api/auth/me', auth, (req, res) => res.json({ user: publicUser(req.user), permissions: ROLE_PERMISSIONS[req.user.role] }))

// ---- storefront: orders are accepted without payment (simulated checkout)
app.post('/api/orders', (req, res) => {
  const o = req.body || {}
  if (!Array.isArray(o.items) || !o.items.length) return res.status(400).json({ error: 'Order has no items.' })
  const id = Math.max(...db.orders.map((x) => x.id)) + 1
  const order = { id, customerId: 'guest', customer: o.customer || 'Guest', items: o.items, total: o.total, paid: false, status: 'Processing', date: new Date().toISOString().slice(0, 10), city: o.city || '', assignedTo: '', note: 'Payment simulated in prototype' }
  db.orders.unshift(order); res.status(201).json(order)
})

// ---- staff API
app.get('/api/orders', auth, requirePermission('orders.view'), (req, res) => res.json(db.orders))
app.patch('/api/orders/:id', auth, requirePermission('orders.update'), (req, res) => {
  const o = db.orders.find((x) => String(x.id) === req.params.id); if (!o) return res.status(404).json({ error: 'Order not found.' })
  const { status, assignedTo, note } = req.body || {}
  if (status) o.status = status; if (assignedTo !== undefined) o.assignedTo = assignedTo; if (note !== undefined) o.note = note
  res.json(o)
})
app.get('/api/products', auth, requirePermission('products.view'), (req, res) => res.json(db.products))
app.patch('/api/products/:id', auth, requirePermission('products.update'), (req, res) => {
  const p = db.products.find((x) => x.id === req.params.id); if (!p) return res.status(404).json({ error: 'Product not found.' })
  Object.assign(p, ['name', 'price', 'status'].reduce((a, k) => (req.body?.[k] !== undefined ? { ...a, [k]: req.body[k] } : a), {})); res.json(p)
})
app.get('/api/inventory', auth, requirePermission('inventory.view'), (req, res) => res.json(db.inventory))
app.patch('/api/inventory/:id', auth, requirePermission('inventory.update'), (req, res) => {
  const i = db.inventory.find((x) => x.id === req.params.id); if (!i) return res.status(404).json({ error: 'Item not found.' })
  if (Number.isFinite(+req.body?.stock) && +req.body.stock >= 0) i.stock = +req.body.stock; res.json(i)
})
app.get('/api/customers', auth, requirePermission('customers.view'), (req, res) => res.json(db.customers))
app.get('/api/employees', auth, requirePermission('employees.view'), (req, res) => res.json(db.employees))
app.patch('/api/employees/:id', auth, requirePermission('employees.manage'), (req, res) => {
  const e = db.employees.find((x) => x.id === req.params.id); if (!e) return res.status(404).json({ error: 'Employee not found.' })
  if (req.body?.role && ROLE_PERMISSIONS[req.body.role]) e.role = req.body.role; if (req.body?.active !== undefined) e.active = !!req.body.active; res.json(e)
})
app.get('/api/tasks', auth, requirePermission('tasks.view'), (req, res) => res.json(db.tasks))
app.patch('/api/tasks/:id', auth, requirePermission('tasks.view'), (req, res) => {
  const t = db.tasks.find((x) => x.id === req.params.id); if (!t) return res.status(404).json({ error: 'Task not found.' })
  if (req.body?.done !== undefined) { t.done = !!req.body.done; t.status = t.done ? 'Done' : 'Pending' } res.json(t)
})
app.get('/api/tickets', auth, requirePermission('support.view'), (req, res) => res.json(db.tickets))
app.get('/api/campaigns', auth, requirePermission('marketing.manage'), (req, res) => res.json({ campaigns: db.campaigns, discountCodes: db.discountCodes }))
app.get('/api/analytics', auth, requirePermission('analytics.view'), (req, res) => res.json({ salesByMonth }))

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }))

// ---- serve the built storefront in production (npm start)
const dist = path.join(__dirname, '../dist')
if (fs.existsSync(dist)) {
  app.use(express.static(dist))
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')))
}
app.listen(PORT, () => console.log(`LUMIÈRE API on http://localhost:${PORT}`))
