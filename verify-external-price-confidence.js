'use strict';

const assert = require('node:assert/strict');
const ui = require('./external-search-ui.js');
const confidence = require('./external-price-confidence.js');

const DE = 'https://shop.example/product';

assert.equal(
  ui.trustedPrice({
    title:'Perfekte Bleistift online kaufen | eBay.de',
    description:'Große Auswahl neuer und gebrauchter Bleistifte online entdecken',
    price:'1500',
    currency:'EUR'
  }, DE),
  '',
  'unverified structured-only price must be hidden by default'
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

let item = confidence.annotate([{
  title:'Bleistift 4B – günstig kaufen – Böttcher AG',
  description:'Bleistift Faber-Castell 9000 Art Set',
  url:'https://www.bueromarkt-boettcher.de/produkt/bleistift-4b',
  image:'https://img.example/bleistift.jpg',
  productCandidate:true,
  price:'17.24',
  currency:'EUR'
}])[0];
assert.equal(item.priceConfidence, 'verified', 'specific retail product with image may retain structured price');
assert.equal(ui.trustedPrice(item, item.url), '17,24 €');

item = confidence.annotate([{
  title:'Der Bleistift (Dinge des Lebens)',
  description:'Gebundene Ausgabe',
  url:'https://www.amazon.de/dp/3701736464',
  image:'https://img.example/book.jpg',
  productCandidate:true,
  price:'15.0',
  currency:'EUR'
}])[0];
assert.equal(item.priceConfidence, 'verified', 'specific Amazon product with image may retain structured price');
assert.equal(ui.trustedPrice(item, item.url), '15,00 €', 'single decimal must remain decimal and never become 150 EUR');

item = confidence.annotate([{
  title:'Faber-Castell Bleistift basic mit Radierer drucken bei FLYERALARM',
  description:'Hochwertige Marken-Bleistifte – jetzt bestellen',
  url:'https://www.flyeralarm.com/de/shop/bleistift',
  image:'https://img.example/bleistift.jpg',
  productCandidate:true,
  price:'1620.82',
  currency:'EUR'
}])[0];
assert.notEqual(item.priceConfidence, 'verified', 'bulk/custom configurator price must remain unverified');
assert.equal(ui.trustedPrice(item, item.url), '');

item = confidence.annotate([{
  title:'Perfekte Bleistift online kaufen | eBay.de',
  description:'Große Auswahl neuer und gebrauchter Bleistifte online entdecken',
  url:'https://www.ebay.de/sch/i.html?_nkw=bleistift',
  image:'https://img.example/bleistift.jpg',
  productCandidate:true,
  price:'1500',
  currency:'EUR'
}])[0];
assert.notEqual(item.priceConfidence, 'verified', 'aggregator/listing price must remain unverified');
assert.equal(ui.trustedPrice(item, item.url), '');

item = confidence.annotate([{
  title:'Specific product',
  description:'No visible price here',
  url:'https://shop.example/product',
  image:'https://img.example/product.jpg',
  productCandidate:true,
  price:'24.90',
  currency:'EUR',
  priceConfidence:'verified'
}])[0];
assert.equal(ui.trustedPrice(item, item.url), '24,90 €', 'worker-verified price remains renderable');

console.log('External price confidence: visible precedence + decimal parser + graded structured-price recovery OK');
