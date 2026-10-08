import { CATEGORIES, MATERIALS, PRICE_BANDS, STONES } from '../data/products';
import { COLLECTIONS } from '../data/collections';

export default function FilterPanel({ f, set, clear }) {
  const toggle = (k, v) => set({ [k]: f[k] === v ? '' : v });
  const group = (title, k, items) => (
    <fieldset className="fp__g"><legend>{title}</legend>
      <div className="fp__opts">{items.map(([v, l]) => <button key={v} type="button" className={`chip ${f[k] === v ? 'is-on' : ''}`} aria-pressed={f[k] === v} onClick={() => toggle(k, v)}>{l}</button>)}</div>
    </fieldset>
  );
  return (
    <div className="fp">
      {group('Category', 'category', CATEGORIES.map((c) => [c, c]))}
      {group('Collection', 'collection', COLLECTIONS.map((c) => [c.id, c.name]))}
      {group('Material', 'material', MATERIALS.map((m) => [m.id, m.label]))}
      {group('Stone', 'stone', STONES.map((s) => [s, s]))}
      {group('Price', 'price', PRICE_BANDS.map((b) => [b.id, b.label]))}
      <button type="button" className="link-arrow" onClick={clear}>Clear all filters</button>
    </div>
  );
}
