'use strict';
const assert=require('node:assert/strict');
const amazon=require('./amazon-product-normalizer.js');

const sample={
  ASIN:'b0abc12345',
  itemInfo:{title:{displayValue:'Test Kopfhörer'},byLineInfo:{brand:{displayValue:'TestBrand'}}},
  images:{primary:{large:{url:'https://example.invalid/image.jpg'}}},
  price:{amount:'49,99',currency:'EUR'},
  availability:'IN_STOCK',
  detailPageURL:'https://www.amazon.de/dp/B0ABC12345?ref_=test',
  category:'electronics.audio'
};
const result=amazon.normalizeItems([sample,{...sample}]);
assert.equal(result.errors.length,0);
assert.equal(result.rows.length,1,'duplicate ASIN must collapse');
const row=result.rows[0];
assert.equal(row.merchantVariantId,'B0ABC12345');
assert.equal(row.source.network,'amazon');
assert.equal(row.merchant,'Amazon');
assert.equal(row.price,49.99);
assert.equal(row.currency,'EUR');
assert.equal(row.inStock,true);
assert.equal(row.active,false,'Amazon must stay inactive until explicitly enabled');
assert.equal(row.affiliateUrl,null,'no affiliate URL may be invented');
assert.match(row.directUrl,/^https:\/\/(?:www\.)?amazon\.de\//);
assert.equal(amazon.normalizeItem({asin:'not-an-asin'}),null);
assert.equal(amazon.safeAmazonUrl('https://evil.example/dp/B0ABC12345'),null);
assert.equal(amazon.safeAmazonUrl('http://www.amazon.de/dp/B0ABC12345'),null);
assert.equal(amazon.canonicalProductUrl('B0ABC12345'),'https://www.amazon.de/dp/B0ABC12345');
assert.deepEqual(amazon.validateRow({...row,affiliateUrl:'https://example.invalid'}).some(x=>x.includes('affiliate URL')),true);
console.log('Amazon adapter foundation gate passed');
