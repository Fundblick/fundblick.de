'use strict';

const assert = require('node:assert/strict');
const ui = require('./external-search-ui.js');

const DE = 'https://shop.example/product';

assert.equal(
  ui.trustedPrice({
    title:'Perfekte Bleistift online kaufen | eBay.de',
    description:'Große Auswahl neuer und gebrauchter Bleistifte online entdecken',
    price:'1500',
    currency:'EUR'
  }, DE),
  '',
  'unverified structured-only price must be hidden'
);

assert.equal(
  ui.trustedPrice({
    title:'Faber-Castell Bleistift basic mit Radierer drucken',
    description:'Hochwertige Marken-Bleistifte – jetzt bestellen',
    price:'1620.82',
    currency:'EUR'
  }, DE),
  '',
  'bulk/custom structured-only price must be hidden without visible evidence'
);

assert.equal(
  ui.trustedPrice({
    title:'Mercedes GL350 gebraucht kaufen | Ab 11.205 € · 161 im Vergleich',
    description:'166 gebrauchte Mercedes GL350 zum Verkauf',
    price:'112050',
    currency:'EUR'
  }, DE),
  '11.205,00 €',
  'visible price must override conflicting hidden metadata'
);

assert.equal(
  ui.trustedPrice({
    title:'Bleistift 4B günstig kaufen',
    description:'12 Qualitäts-Bleistifte – 17,24 € inkl. MwSt.',
    price:'9999',
    currency:'EUR'
  }, DE),
  '17,24 €',
  'visible snippet price must win over structured metadata'
);

assert.equal(
  ui.trustedPrice({
    title:'Specific product',
    description:'No visible price here',
    price:'24.90',
    currency:'EUR',
    priceConfidence:'verified'
  }, DE),
  '24,90 €',
  'worker-verified price may be rendered'
);

console.log('External price confidence: fail-closed rendering + visible-price precedence OK');
