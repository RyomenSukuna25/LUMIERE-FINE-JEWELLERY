import { prefersReducedMotion } from '../utils/format';

export function flyToCart(imgEl) {
  const target = document.querySelector('[data-cart-icon]');
  if (!imgEl || !target || prefersReducedMotion()) return Promise.resolve();
  const a = imgEl.getBoundingClientRect(); const b = target.getBoundingClientRect();
  if (!a.width) return Promise.resolve();
  const clone = document.createElement('img');
  clone.src = imgEl.currentSrc || imgEl.src; clone.alt = ''; clone.className = 'fly';
  Object.assign(clone.style, { left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px` });
  document.body.appendChild(clone);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2); const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const s = Math.max(0.08, 26 / a.width);
  const anim = clone.animate(
    [
      { transform: 'translate(0,0) scale(1)', opacity: 1, offset: 0 },
      { transform: `translate(${dx * 0.55}px, ${dy * 0.35 - 40}px) scale(${Math.max(0.3, s * 4)})`, opacity: 0.95, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(${s})`, opacity: 0.15, offset: 1 },
    ],
    { duration: 780, easing: 'cubic-bezier(.6,0,.3,1)' }
  );
  return anim.finished.then(() => clone.remove()).catch(() => clone.remove());
}
