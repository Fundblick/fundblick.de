'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const Deal=require('./deal-of-day.js');

const root=process.argv[2]||path.join('build','catalog');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
const products=[];
for(const meta of Object.values(manifest.shards||{})){
  const rows=JSON.parse(fs.readFileSync(path.join(root,meta.file),'utf8'));
  products.push(...rows);
}
assert(products.length>0,'production catalog must contain products');
assert.equal(manifest.dataMode,'real','daily offer gate must run against real catalog');
assert.equal(manifest.simulatedCount,0,'daily offer gate must not use simulated products');

const qualified=Deal.select(products,{maxAgeMinutes:Number.MAX_SAFE_INTEGER});
const daily=Deal.selectDaily(products,{date:'2026-09-26',maxAgeMinutes:Number.MAX_SAFE_INTEGER});
assert(daily,'production catalog must provide a daily offer');
assert.equal(daily.simulated,false,'daily offer must be real');
const source=products.find(product=>String(product.id)===String(daily.productId));
assert(source,'selected product must exist in production catalog');
assert.equal(source.testData,false,'selected product must not be test data');
assert.notEqual(source.inStock,false,'selected product must be in stock');
assert(Number(daily.currentPrice)>0,'daily offer needs positive current price');
assert(String(daily.name||'').trim(),'daily offer needs product name');
assert(String(daily.image||'').trim(),'daily offer needs product image');

if(daily.kind==='deal'){
  assert(Number(daily.reference)>Number(daily.currentPrice),'qualified deal reference must exceed current price');
  assert(Number(daily.saving)>=Deal.defaults.minSaving,'qualified deal must meet minimum saving');
  assert(Number(daily.discountPct)>=Deal.defaults.minDiscountPct,'qualified deal must meet minimum percentage');
  assert(['multi-merchant','merchant-reference'].includes(daily.evidence),'qualified deal needs approved evidence type');
}else{
  assert.equal(daily.kind,'spotlight','fallback must be a daily spotlight');
  assert.equal(daily.reference,null,'spotlight must not invent reference price');
  assert.equal(daily.saving,null,'spotlight must not invent savings');
  assert.equal(daily.discountPct,null,'spotlight must not invent discount');
  assert.equal(daily.evidence,'daily-rotation','spotlight evidence must be daily rotation');
}
console.log(`Production daily-offer gate OK: products=${products.length}, qualified=${qualified?qualified.productId:'none'}, selected=${daily.productId}, kind=${daily.kind}`);
