'use strict';
const assert=require('node:assert/strict');
const n=require('./amazgifts-feed-normalizer.js');
const rows=[
 {merchant_id:'87569',data_feed_id:'95497',merchant_product_id:'p1',product_name:'Personalisierte Halskette mit Foto',description:'Geschenk',merchant_deep_link:'https://www.amazgifts.de/products/x',aw_deep_link:'https://www.awin1.com/cread.php?awinmid=87569&awinaffid=3106259&ued=https%3A%2F%2Fwww.amazgifts.de%2Fproducts%2Fx',merchant_image_url:'https://img.example/x.jpg',search_price:'29.99',currency:'EUR'},
 {merchant_id:'87569',data_feed_id:'95497',merchant_product_id:'p2',product_name:'Perlenkettenzubehör Stahldraht',description:'Schmuckzubehör',merchant_deep_link:'https://amazgifts.de/products/y',aw_deep_link:'https://www.awin1.com/cread.php?awinmid=87569&awinaffid=3106259&ued=https%3A%2F%2Famazgifts.de%2Fproducts%2Fy',merchant_image_url:'https://img.example/y.jpg',search_price:'9.99',currency:'EUR'},
 {merchant_id:'87569',data_feed_id:'95470',merchant_product_id:'old',product_name:'Alte Feedkopie',merchant_deep_link:'https://amazgifts.de/products/old',aw_deep_link:'https://www.awin1.com/cread.php?awinmid=87569&awinaffid=3106259',merchant_image_url:'https://img.example/old.jpg',search_price:'1.00',currency:'EUR'}
];
const s=n.selectRows(rows);assert.equal(s.advertiser.length,3);assert.equal(s.preferred.length,2);
const out=n.normalize(rows);assert.equal(out.length,2);assert.equal(out[0].category,'gifts.personalized.jewelry');assert.equal(out[1].category,'craft.jewelry-making.supplies');assert.equal(out[0].affiliateUrl,rows[0].aw_deep_link);assert.equal(n.validate(out).length,0);
assert.equal(out[0].rawAttributes.taxonomyFamily,'gifts');
assert.equal(out[0].rawAttributes.productType,'Schmuck');
assert.equal(out[1].rawAttributes.productType,'Schmuckzubehör');
assert.equal(out[0].shippingCost,null,'blank delivery_cost must remain unknown, not free shipping');
assert.equal(out[1].shippingCost,null,'blank delivery_cost must remain unknown, not free shipping');
assert.equal(out[0].availability,'UNKNOWN');
assert.equal(out[0].inStock,null,'missing stock evidence must remain unknown');
assert.equal(n.validAffiliate('https://www.awin1.com/pclick.php?p=38392705049&a=3106259&m=87569'),true);
assert.equal(n.validAffiliate('https://www.awin1.com/cread.php?awinmid=87569&awinaffid=3106259'),true);
assert.equal(n.validDirect('https://evil.example/products/x'),false);assert.equal(n.validAffiliate('https://www.awin1.com/cread.php?awinmid=87569&awinaffid=999'),false);
console.log('Amazgifts normalizer: preferred feed + taxonomy + Awin/direct-link safety OK');