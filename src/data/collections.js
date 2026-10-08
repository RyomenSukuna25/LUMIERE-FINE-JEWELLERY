import { PRODUCTS, productImg } from './products';
const find = (slug) => PRODUCTS.find((p) => p.slug === slug);
const def = [
  ['rings', 'Rings', 'Solitaires, bands and coloured stones, made to be worn every day.', 'aurelia-solitaire-ring', 1, 'Engagement, anniversary, everyday'],
  ['necklaces', 'Necklaces', 'Fine chains, diamond stations and collars with a quiet kind of weight.', 'lumiere-heritage-necklace', 0, 'Layer them or wear one alone'],
  ['earrings', 'Earrings', 'Studs for every morning, drops and chandeliers for the evening.', 'seraphine-drop-earrings', 0, 'From studs to chandeliers'],
  ['bracelets', 'Bracelets', 'Tennis lines, polished bangles and open cuffs.', 'etoile-diamond-bracelet', 0, 'Close to the wrist'],
  ['bridal', 'Bridal', 'Collars, sets and chandeliers designed together for the day itself.', 'ananya-bridal-set', 0, 'Designed as sets'],
  ['diamond', 'Diamond', 'Every piece where a diamond leads.', 'celeste-diamond-ring', 1, 'Brilliant, always'],
  ['gold', 'Gold', 'Warm, polished and made to last, in rose and yellow gold.', 'savi-gold-bangle', 0, 'Polished and plain'],
  ['new-arrivals', 'New Arrivals', 'The latest pieces from the atelier.', 'isolde-sapphire-ring', 0, 'Just added'],
];
export const COLLECTIONS = def.map(([id, name, blurb, cover, view, tag]) => {
  const p = find(cover);
  return {
    id, name, blurb, tag,
    cover: productImg(p, view, 1200), coverSm: productImg(p, view, 800), coverXs: productImg(p, view, 480),
    coverAlt: `${name} collection, featuring the ${p.name}`,
    get count() { return PRODUCTS.filter((x) => x.collections.includes(id)).length; },
  };
});
