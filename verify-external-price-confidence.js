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
  title:'10w40 Motoröl zum besten Preis kaufen - ATU',
  description:'Wählen Sie aus einem großen Sortiment an verschiedenen Modellen von einem 10w40 motoröl.',
  url:'https://www.atu.de/10w40-oel-fr.html?filters&sort=price|asc',
  image:'https://img.example/atu-logo.jpg',
  productCandidate:true,
  price:'5.00',
  currency:'EUR'
}])[0];
assert.equal(confidence.looksLikeListingPage(item), true, 'ATU category page must be recognized as a listing page');
assert.notEqual(item.priceConfidence, 'verified', 'listing minimum price must not become an individual product price');
assert.equal(ui.trustedPrice(item, item.url), '');

item = confidence.annotate([{
  title:'10w40 Öl zum besten Preis kaufen - ATU',
  description:'Castrol Magnatec Diesel 10W-40 B4 Motoröl, 5 Liter',
  url:'https://www.atu.de/10w40-oel-fr.html?filters&sort=price|asc',
  image:'https://img.example/atu-logo.jpg',
  productCandidate:true,
  price:'5.00',
  currency:'EUR'
}])[0];
assert.notEqual(item.priceConfidence, 'verified', 'category-page minimum price must never be attached to the named Castrol 5L item');
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


const voucher=confidence.annotate([{title:'Nike Cortez Damensneaker online kaufen | OTTO',description:'Nike Sportswear Cortez Sneaker. 10 € Gutschein für deine erste Bestellung',url:'https://www.otto.de/p/nike-cortez-S0TEST/',image:'https://img.example/cortez.jpg',productCandidate:true,price:'10,00 €',currency:'EUR',priceConfidence:'visible'}])[0];
assert.equal(voucher.priceIssue,'non-offer-amount','voucher amount must not become the Cortez product price');
assert.equal(ui.trustedPrice(voucher,voucher.url),'');

console.log('External price confidence: visible precedence + decimal parser + listing-price isolation OK');

const promotion={title:'Akku-Bohrschrauber Bosch GSR 18V-65',description:'Kaufen Sie Bosch Professional Produkte für mindestens 236,81 € inkl. MwSt. und erhalten Sie eine Zugabe.',url:'https://shop.example/product/bosch',image:'https://img.example/drill.jpg',productCandidate:true,price:'236,81 €',currency:'EUR',priceConfidence:'visible'};
const rejected=confidence.annotate([promotion])[0];
assert.equal(rejected.priceIssue,'non-offer-amount');assert.equal(ui.trustedPrice(rejected,rejected.url),'');assert.equal(ui.offerEligible(rejected),false,'promotion thresholds are not purchase offers');
assert.equal(ui.visiblePriceFromText('Versand 4,95 €; Produktpreis 24,90 €'),'24,90 €');
assert.equal(ui.visiblePriceFromText('Grundpreis 7,00 € / l; Gesamtpreis 34,99 €'),'34,99 €');
assert.equal(ui.visiblePriceFromText('UVP 99,99 €; jetzt 79,99 €'),'79,99 €');
assert.equal(ui.visiblePriceFromText('Gratisversand ab 50,00 €'),'');
assert.equal(ui.trustedPrice({...promotion,price:'249.99',priceConfidence:'verified'},promotion.url),'249,99 €','independent different offer price remains usable');
const aligned=confidence.annotate([{...promotion,description:'Produktpreis 249,99 €',price:'236.81',priceConfidence:'structured'}])[0];assert.equal(aligned.price,'249,99 €','sorting metadata uses the same visible price as the card');
const detail={title:'Hausschuhe online kaufen | OTTO',description:'UGG Tasman II Hausschuh',url:'https://www.otto.de/p/ugg-tasman-ii-S0EXAMPLE/',image:'https://img.example/tasman.jpg',productCandidate:true,price:'109.95',currency:'EUR',priceConfidence:'structured'};
assert.equal(confidence.annotate([detail])[0].priceConfidence,'verified','structured product-detail evidence survives a generic provider title');
for(const change of [{url:'https://www.otto.de/schuhe/hausschuhe/'},{url:'https://www.otto.de/category/hausschuhe/'},{productCandidate:false},{priceConfidence:'unverified'},{image:''},{description:'Große Auswahl neuer Hausschuhe'}]){
 assert.notEqual(confidence.annotate([{...detail,...change}])[0].priceConfidence,'verified','listing, missing product evidence and blocked context stay excluded: '+JSON.stringify(change));
}
