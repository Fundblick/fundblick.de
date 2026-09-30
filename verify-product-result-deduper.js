'use strict';
const assert=require('node:assert/strict');const d=require('./product-result-deduper.js');
const a={url:'https://shop.de/product/123',title:'Bosch GSR 18V-55 Akkuschrauber',price:'129,99 €',image:'a.jpg'};
const b={url:'https://shop.de/product/456',title:'Bosch GSR 18V-55 Akkuschrauber',price:'139,99 €',image:'b.jpg',description:'Set'};
assert.equal(d.dedupe([a,b]).length,1,'same merchant + equivalent title should collapse');
assert.equal(d.dedupe([a,{...a,url:'https://other.de/product/123'}]).length,2,'same product at another merchant is a useful separate offer');
assert.equal(d.dedupe([{...a,gtin:'4000001'},{...b,gtin:'4000001',url:'https://other.de/x'}]).length,1,'stable product id wins across URLs');
const weak={url:'https://shop.de/a',title:'Makita DDF485 18V',price:'99,00 €'};const rich={url:'https://shop.de/b',title:'Makita DDF485 18V',price:'99,00 €',image:'x.jpg',description:'inkl. Koffer',priceConfidence:'verified'};const got=d.dedupe([weak,rich]);assert.equal(got.length,1);assert.equal(got[0].image,'x.jpg','richer duplicate should survive');
console.log('Product result deduper: merchant duplicates collapse; cross-merchant offers remain distinct');