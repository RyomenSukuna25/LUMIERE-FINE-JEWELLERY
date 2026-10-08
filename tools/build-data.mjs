import fs from 'node:fs';
import { products, editorial } from './catalog.mjs';
fs.writeFileSync('src/data/catalog.json', JSON.stringify({ products, editorial }, null, 1));
console.log('catalog.json', products.length, 'products', editorial.length, 'editorial');
