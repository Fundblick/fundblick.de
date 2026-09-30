'use strict';
const assert=require('node:assert/strict');const p=require('./product-intelligence-pipeline.js');
const results=[
 {title:'Castrol Magnatec 10W-40 5 Liter',description:'Motoröl',price:'34,99'},
 {title:'Liqui Moly 10W-40 5 L',description:'Motoröl',price:'36,99'},
 {title:'Mobil 10W-40 1 Liter',description:'Motoröl',price:'9,99'},
 {title:'Shell 10W-40 5 Liter',description:'Motoröl',price:'32,50'}
];
const out=p.run('10W40 Motoröl',results,{facets:{minCoverage:.5,maxPrimary:6}});
assert.equal(out.analysis.category,'automotive.motor_oil');assert.equal(out.results.length,4);assert.equal(out.results[0].attributes.volume.value,5);assert.equal(out.results[0].attributes.unit_price.unit,'EUR/l');assert.equal(out.results[0].attributes.unit_price.value,6.998);const ids=out.facets.primary.map(x=>x.id);assert.ok(ids.includes('brand'));assert.ok(ids.includes('viscosity'));assert.ok(ids.includes('volume'));assert.ok(ids.includes('price'));assert.ok(ids.includes('unit_price'));assert.ok(!ids.includes('approval'));console.log('Product intelligence pipeline: query -> extraction -> unit price -> dynamic facets OK');