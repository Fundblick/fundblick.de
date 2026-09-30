'use strict';
const assert=require('node:assert/strict');const q=require('./product-query-strategy.js');
let x=q.build('10W40 5 Liter','de');assert.equal(x.analysis.category,'automotive.motor_oil');assert.match(x.query,/Motoröl/i);assert.match(x.query,/10W-40/i);assert.equal(x.added.filter(v=>/liter/i.test(v)).length,0,'existing volume must not be duplicated');
x=q.build('Winterreifen 205/55 R16','de');assert.equal(x.analysis.category,'automotive.tires');assert.match(x.query,/205\/55 R16/i);assert.equal((x.query.match(/205\/55 R16/gi)||[]).length,1);
x=q.build('Akkuschrauber 18V','de');assert.equal(x.analysis.category,'tools.cordless_drill');assert.equal((x.query.match(/18V/gi)||[]).length,1);
x=q.build('Adidas Schuhe EU 39','de');assert.equal(x.analysis.category,'fashion.shoes');assert.equal((x.query.match(/adidas/gi)||[]).length,1);assert.equal((x.query.match(/EU 39/gi)||[]).length,1);
x=q.build('205/55 R16','de');assert.equal(x.analysis.category,null,'dimensions alone must not invent a category');assert.equal(x.query,'205/55 R16');
console.log('Product query strategy: category-aware refinement without duplicate constraints OK');