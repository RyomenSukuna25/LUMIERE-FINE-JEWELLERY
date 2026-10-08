export const inr = (n) => '₹' + new Intl.NumberFormat('en-IN').format(Math.round(n));
export const inrCompact = (n) => {
  if (n >= 1e7) return '₹' + (n / 1e7).toFixed(2) + ' Cr';
  if (n >= 1e5) return '₹' + (n / 1e5).toFixed(2) + ' L';
  return inr(n);
};
export const pct = (a, b) => Math.round(((b - a) / b) * 100);
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const dateFmt = (d, o = { day: '2-digit', month: 'short', year: 'numeric' }) => new Date(d).toLocaleDateString('en-IN', o);
export const GST_RATE = 0.03;
export const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isTouch = () => typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;
export const cx = (...a) => a.filter(Boolean).join(' ');
export const sha = async (s) => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
};
