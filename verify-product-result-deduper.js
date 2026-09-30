'use strict';
const assert=require('node:assert/strict');const d=require('./product-result-deduper.js');
const a={url:'https://shop.de/product/123',title:'Bosch GSR 18V-55 Akkuschrauber',price:'129,99 €',image:'a.jpg'};
const b={url:'https://shop.de/product/456',title:'Bosch GSR 18V-55 Akkuschrauber',price:'139,99 €',image:'b.jpg',description:'Set'};
assert.equal(d.dedupe([a,b]).length,1,'same merchant + equivalent title should collapse');
assert.equal(d.dedupe([a,{...a,url:'https://other.de/product/123'}]).length,2,'same product at another merchant is a useful separate offer');
assert.equal(d.dedupe([{...a,gtin:'4000001'},{...b,gtin:'4000001',url:'https://other.de/x'}]).length,2,'stable product id must preserve separate merchant offers');
assert.equal(d.dedupe([{...a,gtin:'4000001'},{...b,ean:'4000001',title:'Different product description'}]).length,1,'GTIN and EAN identify the same product within a merchant');
for(const field of ['gtin','ean','sku','mpn']){
 assert.equal(d.dedupe([{...a,[field]:'ABC-123'},{...b,[field]:'ABC123'}]).length,1,`${field} duplicates at the same merchant collapse`);
 assert.equal(d.dedupe([{...a,[field]:'ABC123'},{...b,[field]:'ABC123',url:'https://other.de/x'}]).length,2,`${field} must not remove another merchant`);
}
assert.equal(d.dedupe([{...a,sku:'123'},{...b,mpn:'123'}]).length,2,'different identifier namespaces must not collide');
assert.equal(d.dedupe([{title:'Same product',gtin:'123'},{title:'Same product',gtin:'123'}]).length,2,'unknown merchants must not be merged');
assert.equal(d.dedupe([a,{...b,url:'https://www.shop.de/other'}]).length,1,'www aliases belong to the same merchant');
assert.equal(d.dedupe([a,{...a,title:'Bosch GSR 18V-21 Akkuschrauber'}]).length,2,'model numbers must remain distinct');
assert.equal(d.dedupe([a,{...b,attributeConflicts:['voltage']}]).length,2,'disputed variants must not replace an unambiguous offer');
const weak={url:'https://shop.de/a',title:'Makita DDF485 18V',price:'99,00 €'};const rich={url:'https://shop.de/b',title:'Makita DDF485 18V',price:'99,00 €',image:'x.jpg',description:'inkl. Koffer',priceConfidence:'verified'};const got=d.dedupe([weak,rich]);assert.equal(got.length,1);assert.equal(got[0].image,'x.jpg','richer duplicate should survive');
console.log('Product result deduper: merchant duplicates collapse; cross-merchant offers remain distinct');
