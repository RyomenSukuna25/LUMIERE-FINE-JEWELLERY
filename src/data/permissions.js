export const PERMISSIONS = [
  'orders.view', 'orders.update', 'products.view', 'products.create', 'products.update',
  'inventory.view', 'inventory.update', 'customers.view', 'employees.view', 'employees.manage',
  'analytics.view', 'settings.manage', 'collections.manage', 'content.manage', 'marketing.manage',
  'tasks.view', 'support.respond',
];
export const ROLES = {
  CUSTOMER: [],
  EMPLOYEE: ['tasks.view', 'orders.view', 'orders.update', 'inventory.view', 'support.respond'],
  MANAGER: [
    'orders.view', 'orders.update', 'products.view', 'products.create', 'products.update', 'inventory.view', 'inventory.update',
    'customers.view', 'employees.view', 'analytics.view', 'collections.manage', 'tasks.view', 'support.respond',
  ],
  ADMIN: PERMISSIONS,
};
export const ROLE_LABEL = { CUSTOMER: 'Customer', EMPLOYEE: 'Employee', MANAGER: 'Manager', ADMIN: 'Admin' };
export const can = (role, perm) => (ROLES[role] || []).includes(perm);

// module key -> { label, path, permission }. Visibility = permission AND (for employees) assigned module.
export const MODULES = [
  { key: 'overview', label: 'Overview', path: '/staff', perm: null, roles: ['ADMIN', 'MANAGER'] },
  { key: 'tasks', label: 'My Tasks', path: '/staff/tasks', perm: 'tasks.view' },
  { key: 'orders', label: 'Orders', path: '/staff/orders', perm: 'orders.view' },
  { key: 'products', label: 'Products', path: '/staff/products', perm: 'products.view' },
  { key: 'inventory', label: 'Inventory', path: '/staff/inventory', perm: 'inventory.view' },
  { key: 'customers', label: 'Customers', path: '/staff/customers', perm: 'customers.view' },
  { key: 'support', label: 'Customer Support', path: '/staff/support', perm: 'support.respond' },
  { key: 'employees', label: 'Employees', path: '/staff/employees', perm: 'employees.view' },
  { key: 'collections', label: 'Collections', path: '/staff/collections', perm: 'collections.manage' },
  { key: 'content', label: 'Content', path: '/staff/content', perm: 'content.manage' },
  { key: 'analytics', label: 'Analytics', path: '/staff/analytics', perm: 'analytics.view' },
  { key: 'marketing', label: 'Marketing', path: '/staff/marketing', perm: 'marketing.manage' },
  { key: 'settings', label: 'Settings', path: '/staff/settings', perm: 'settings.manage' },
];
export const modulesFor = (role, assigned) =>
  MODULES.filter((m) => {
    if (m.roles && !m.roles.includes(role)) return false;
    if (m.perm && !can(role, m.perm)) return false;
    if (role === 'EMPLOYEE' && assigned && !assigned.includes(m.key)) return false;
    if (role !== 'EMPLOYEE' && m.key === 'tasks') return false;
    if (role !== 'EMPLOYEE' && m.key === 'support') return role === 'MANAGER';
    return true;
  });
