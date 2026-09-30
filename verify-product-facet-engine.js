'use strict';
const assert=require('node:assert/strict');
const facets=require('./product-facet-engine.js');
const analysis={facets:['brand','viscosity','volume','approval','price','unit_price']};
const results=[
 {attributes:{brand:'Castrol',viscosity:'10W-40',volume:5,approval:'MB 229.1',unit_price:7.0}},
 {attributes:{brand:'Liqui Moly',viscosity:'10W-40',volume:5,unit_price:7.4}},
 {attributes:{brand:'Mobil',viscosity:'10W-40',volume:1,unit_price:9.9}},
 {attributes:{brand:'Shell',viscosity:'10W-40',volume:5}}
];
const out=facets.derive(analysis,results,{minCoverage:.5,maxPrimary:6});
const ids=out.primary.map(x=>x.id);
assert.ok(ids.includes('brand'));
assert.ok(ids.includes('price'));
assert.ok(ids.includes('viscosity'));
assert.ok(ids.includes('volume'));
assert.ok(ids.includes('unit_price'));
assert.ok(!ids.includes('approval'),'sparse facet must stay hidden');
assert.equal(out.sampleSize,4);
console.log('Dynamic facet engine: coverage threshold + conservative primary facets OK');
