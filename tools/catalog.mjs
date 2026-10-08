// Single source of truth for the LUMIÈRE catalogue.
// tools/art.mjs renders imagery from these specs; tools/build-data.mjs emits src/data/catalog.json.

const METAL_LABEL = { rose: '18K Rose Gold', yellow: '18K Yellow Gold', white: '18K White Gold' };
const STONE_LABEL = {
  diamond: 'Diamonds', emerald: 'Emerald', ruby: 'Ruby', sapphire: 'Blue Sapphire',
  morganite: 'Morganite', pearl: 'Cultured Pearl', none: 'Polished gold',
};

// [name, category, metal, stone, style, bg, price, compare, tags, copy]
const R = [
  ['Celeste Diamond Ring', 'Rings', 'rose', 'diamond', 'halo', 'sand', 52999, 68000, 'bestseller featured', 'A brilliant centre stone held in a delicate halo, set on a hand-finished rose gold band.'],
  ['Aurelia Solitaire Ring', 'Rings', 'yellow', 'diamond', 'solitaire', 'noir', 124000, 0, 'featured', 'One stone, nothing else. A six-prong solitaire cut to catch light from every angle.'],
  ['Élan Gold Band', 'Rings', 'yellow', 'none', 'band', 'ivory', 28500, 0, 'bestseller', 'A sculpted band in polished yellow gold, made to be worn every day and kept for decades.'],
  ['Seraphine Trilogy Ring', 'Rings', 'white', 'diamond', 'trilogy', 'stone', 86500, 0, 'new', 'Three diamonds for the past, the present and the part still to come.'],
  ['Noor Emerald Ring', 'Rings', 'yellow', 'emerald', 'halo', 'noir', 98000, 112000, 'featured', 'A deep green emerald encircled by diamonds, in warm yellow gold.'],
  ['Vesper Pavé Band', 'Rings', 'rose', 'diamond', 'pave', 'blush', 46500, 0, 'new', 'A slim band with pavé diamonds set by hand along its crown.'],
  ['Isolde Sapphire Ring', 'Rings', 'white', 'sapphire', 'solitaire-oval', 'stone', 112000, 0, 'new', 'An oval blue sapphire in a minimal white gold setting.'],
  ['Marguerite Cluster Ring', 'Rings', 'rose', 'morganite', 'cluster', 'blush', 61000, 0, '', 'A soft pink morganite surrounded by petals of diamond.'],
  ['Opaline Eternity Band', 'Rings', 'white', 'diamond', 'eternity', 'ivory', 78000, 0, 'bestseller', 'Diamonds all the way around, so the line of light never ends.'],
  ['Ruhi Ruby Ring', 'Rings', 'yellow', 'ruby', 'halo', 'noir', 89500, 0, '', 'A deep red ruby with a diamond halo, in polished yellow gold.'],

  ['Lumière Heritage Necklace', 'Necklaces', 'yellow', 'diamond', 'station', 'noir', 168000, 0, 'featured', 'Graduated diamond stations on a fine gold chain, drawn from our archive of heirloom designs.'],
  ['Mirage Station Necklace', 'Necklaces', 'rose', 'diamond', 'station', 'sand', 74000, 0, 'new bestseller', 'Diamonds float along a rose gold chain, light enough for every day.'],
  ['Aanya Bridal Collar', 'Necklaces', 'yellow', 'diamond', 'collar', 'noir', 245000, 0, 'bridal featured', 'A collar of pavé diamonds finished with graduated drops, made for the day itself.'],
  ['Zara Emerald Drop Necklace', 'Necklaces', 'yellow', 'emerald', 'collar', 'noir', 198000, 0, 'bridal', 'Emerald drops hang from a diamond-set collar in yellow gold.'],
  ['Soleil Rivière Necklace', 'Necklaces', 'white', 'diamond', 'riviere', 'stone', 142000, 0, '', 'A continuous line of graduated diamonds in white gold.'],

  ['Étoile Solitaire Pendant', 'Pendants', 'white', 'diamond', 'pendant', 'ivory', 38999, 0, 'bestseller', 'A single diamond on a slim white gold chain.'],
  ['Anika Emerald Pendant', 'Pendants', 'yellow', 'emerald', 'pendant', 'noir', 32900, 0, 'new', 'A rich emerald in a polished gold bezel.'],
  ['Luna Pearl Pendant', 'Pendants', 'yellow', 'pearl', 'pendant', 'sand', 21500, 0, '', 'A cultured pearl, warm and luminous, on a fine gold chain.'],

  ['Seraphine Drop Earrings', 'Earrings', 'yellow', 'diamond', 'drop', 'noir', 62000, 0, 'featured bestseller', 'Pear-cut diamonds that move with you, hung from a diamond stud.'],
  ['Pearl Drop Earrings', 'Earrings', 'yellow', 'pearl', 'drop', 'sand', 12499, 0, 'bestseller', 'Cultured pearls on a simple gold drop. Easy to wear, hard to put down.'],
  ['Rani Chandelier Earrings', 'Earrings', 'yellow', 'diamond', 'chandelier', 'noir', 134000, 0, 'bridal featured', 'Tiered diamond drops in a graceful chandelier shape.'],
  ['Brilliance Studs', 'Earrings', 'white', 'diamond', 'studs', 'ivory', 34500, 0, 'bestseller', 'Round brilliant diamonds in a four-prong setting. The pair you will wear every day.'],
  ['Isha Emerald Studs', 'Earrings', 'yellow', 'emerald', 'studs', 'noir', 41500, 0, 'new', 'Emerald studs in yellow gold with a polished finish.'],
  ['Halo Hoops', 'Earrings', 'rose', 'diamond', 'hoops', 'blush', 56000, 0, '', 'Rose gold hoops set with a line of pavé diamonds.'],
  ['Tara Ruby Drops', 'Earrings', 'rose', 'ruby', 'drop', 'stone', 72500, 0, 'new', 'Ruby drops in rose gold, with a diamond top.'],
  ['Nila Sapphire Studs', 'Earrings', 'white', 'sapphire', 'studs', 'stone', 39000, 0, '', 'Blue sapphire studs in white gold.'],

  ['Étoile Diamond Bracelet', 'Bracelets', 'white', 'diamond', 'tennis', 'ivory', 96500, 0, 'featured', 'A flexible line of diamonds that sits close to the wrist.'],
  ['Rose Tennis Bracelet', 'Bracelets', 'rose', 'diamond', 'tennis', 'blush', 84000, 0, 'new', 'The classic tennis bracelet, in rose gold.'],
  ['Savi Gold Bangle', 'Bracelets', 'yellow', 'none', 'bangle', 'sand', 72000, 0, 'bestseller', 'A solid yellow gold bangle with a hand-polished finish.'],
  ['Kaya Cuff', 'Bracelets', 'rose', 'none', 'cuff', 'stone', 45500, 0, '', 'An open cuff in rose gold, sculpted to rest on the wrist.'],
  ['Mira Emerald Bracelet', 'Bracelets', 'yellow', 'emerald', 'tennis', 'noir', 91000, 0, 'new', 'Emeralds linked in yellow gold.'],

  ['Ananya Bridal Set', 'Sets', 'yellow', 'diamond', 'set-collar', 'noir', 385000, 0, 'bridal featured', 'A collar necklace and chandelier earrings, designed together.'],
  ['Devika Emerald Bridal Set', 'Sets', 'yellow', 'emerald', 'set-collar', 'noir', 312000, 0, 'bridal', 'Emerald and diamond necklace with matching drop earrings.'],
  ['Priya Diamond Set', 'Sets', 'white', 'diamond', 'set-station', 'stone', 198000, 0, 'bridal', 'A station necklace with matching drop earrings in white gold.'],
  ['Mehr Pearl Set', 'Sets', 'yellow', 'pearl', 'set-station', 'sand', 86000, 0, '', 'A pearl pendant and drop earrings, made to be worn together or apart.'],
  ['Rose Reverie Set', 'Sets', 'rose', 'morganite', 'set-station', 'blush', 124000, 0, 'new', 'Morganite and diamond necklace and earrings in rose gold.'],
];

const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const VIEWS = [
  { key: 'main', label: 'Studio view' },
  { key: 'macro', label: 'Close detail' },
  { key: 'flat', label: 'Styled flat lay' },
];
const ALT_BG = { sand: ['stone', 'ivory'], noir: ['sand', 'silk'], ivory: ['sand', 'blush'], stone: ['noir', 'ivory'], blush: ['ivory', 'silk'] };

export const products = R.map((r, i) => {
  const [name, category, metal, stone, style, bg, price, compare, tags, copy] = r;
  const t = tags.split(' ').filter(Boolean);
  const isRing = category === 'Rings';
  const collections = [category.toLowerCase()];
  if (t.includes('bridal')) collections.push('bridal');
  if (stone === 'diamond') collections.push('diamond');
  if (metal === 'yellow' || stone === 'none') collections.push('gold');
  if (t.includes('new')) collections.push('new-arrivals');
  const sizes = isRing ? ['12', '14', '16', '18', '20'] : category === 'Bracelets' ? ['2.4', '2.6', '2.8'] : ['One size'];
  const id = `LM${String(1001 + i)}`;
  return {
    id, slug: slug(name), name, category,
    collection: collections[collections.length > 1 ? 1 : 0], collections,
    price, compareAtPrice: compare || null,
    description: copy,
    material: METAL_LABEL[metal], metal, stone: STONE_LABEL[stone], stoneKind: stone, style,
    sizes, availability: i % 11 === 7 ? 'low-stock' : 'in-stock',
    stock: i % 11 === 7 ? 2 : 4 + ((i * 7) % 14),
    rating: Math.round((4.5 + ((i * 13) % 5) / 10) * 10) / 10,
    reviews: 18 + ((i * 37) % 160),
    featured: t.includes('featured'), newArrival: t.includes('new'), bestseller: t.includes('bestseller'),
    views: VIEWS.map((v, k) => ({ key: v.key, label: v.label, bg: k === 0 ? bg : ALT_BG[bg][k - 1], file: `${slug(name)}-${k + 1}` })),
  };
});

export const editorial = [
  { id: 'silk-champagne', scene: 'silk', pal: 'champagne', alt: 'Champagne silk falling in soft folds' },
  { id: 'silk-noir', scene: 'silk', pal: 'noir', alt: 'Dark silk catching a thin line of warm light' },
  { id: 'silk-blush', scene: 'silk', pal: 'blush', alt: 'Blush silk with a long soft highlight' },
  { id: 'macro-diamond', scene: 'macro', pal: 'diamond', alt: 'Macro view of a round brilliant diamond' },
  { id: 'macro-emerald', scene: 'macro', pal: 'emerald', alt: 'Macro view of a faceted emerald' },
  { id: 'macro-ruby', scene: 'macro', pal: 'ruby', alt: 'Macro view of a faceted ruby' },
  { id: 'jewel-box', scene: 'box', pal: 'sand', alt: 'Open jewellery box with a ring on a cushion' },
  { id: 'showroom-arch', scene: 'arch', pal: 'sand', alt: 'Arched showroom window with a warm shaft of light' },
  { id: 'atelier-bench', scene: 'atelier', pal: 'noir', alt: 'Goldsmith bench with a ring mandrel, loupe and tools' },
  { id: 'gem-trays', scene: 'trays', pal: 'noir', alt: 'Trays of loose diamonds and coloured stones on velvet' },
  { id: 'gold-bars', scene: 'gold', pal: 'noir', alt: 'Bars of fine gold stacked in warm light' },
  { id: 'pearl-strand', scene: 'pearls', pal: 'sand', alt: 'A strand of cultured pearls draped over stone' },
  { id: 'plinth-ring', scene: 'plinth', pal: 'ivory', alt: 'A ring on a stone plinth in a quiet gallery' },
  { id: 'vitrine', scene: 'vitrine', pal: 'noir', alt: 'A glass display case lit from above' },
];

export const VIEW_LIST = VIEWS;
