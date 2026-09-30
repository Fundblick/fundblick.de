'use strict';
const assert=require('node:assert/strict');const p=require('./external-result-page.js');
const items=Array.from({length:47},(_,i)=>({id:i+1,currency:'EUR',price:`${47-i},99`,attributes:{unit_price:{value:(47-i)/5,unit:'EUR/l'}}}));
let x=p.page(items,{page:1,pageSize:20});assert.equal(x.items.length,20);assert.equal(x.total,47);assert.equal(x.totalPages,3);assert.equal(x.hasNext,true);assert.equal(x.hasPrevious,false);
x=p.page(items,{page:2,pageSize:20});assert.equal(x.items.length,20);assert.equal(x.hasNext,true);assert.equal(x.hasPrevious,true);
x=p.page(items,{page:3,pageSize:20});assert.equal(x.items.length,7);assert.equal(x.hasNext,false);
x=p.page(items,{page:1,pageSize:20,sort:'price-asc'});assert.equal(x.items[0].id,47);assert.equal(x.items[19].id,28);
x=p.page(items,{page:1,pageSize:20,sort:'price-desc'});assert.equal(x.items[0].id,1);
x=p.page(items,{page:1,pageSize:20,sort:'unit-price-asc'});assert.equal(x.items[0].id,47);
assert.equal(p.numeric('1.299,99 €'),1299.99);assert.equal(p.numeric('34,99 EUR'),34.99);
console.log('External result paging: 20/page + price/unit-price sorting OK');

const mixedCurrency=[{id:'eur',price:20,currency:'EUR'},{id:'usd',price:10,currency:'USD'}];assert.deepEqual(p.sort(mixedCurrency,'price-asc'),mixedCurrency,'do not compare EUR and USD as raw numbers');assert.deepEqual(p.availableSortModes(mixedCurrency),['relevance']);
const unknownCurrency=[{price:20,currency:'EUR'},{price:10}];assert.deepEqual(p.sort(unknownCurrency,'price-desc'),unknownCurrency);
const mixedBasis=[{attributes:{unit_price:{value:20,unit:'EUR/l'}}},{attributes:{unit_price:{value:10,unit:'EUR/kg'}}}];assert.deepEqual(p.sort(mixedBasis,'unit-price-asc'),mixedBasis,'litre and kilogram prices are not comparable');
const missing=[{id:'unknown'},{id:'high',price:'29,99 €'},{id:'low',price:'19,99 €'}];assert.deepEqual(p.sort(missing,'price-asc').map(x=>x.id),['low','high','unknown']);assert.deepEqual(p.sort(missing,'price-desc').map(x=>x.id),['high','low','unknown']);assert.equal(missing[0].id,'unknown','sorting does not mutate input');
