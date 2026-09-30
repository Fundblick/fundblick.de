'use strict';

const equivalentPipeline=require('./product-intelligence-pipeline.js');
const equivalentAssert=require('node:assert/strict');
const equivalentVolume=equivalentPipeline.run('10W40 5 Liter',[{title:'Motoröl 10W40 5 Liter',price:30,currency:'EUR',attributes:{volume:{value:5000,unit:'ml',confidence:'HIGH'}}}]).results[0];
equivalentAssert.equal(equivalentVolume.constraintMatch.conflicts,0,'equivalent structured and title volumes agree in extraction and ranking');equivalentAssert.deepEqual(equivalentVolume.attributeConflicts,[]);equivalentAssert.equal(equivalentVolume.attributes.unit_price.value,6);
const assert=require('node:assert/strict');const p=require('./product-intelligence-pipeline.js');
let results=[
 {title:'Castrol Magnatec 10W-40 5 Liter',description:'Motoröl',currency:'EUR',price:'34,99'},
 {title:'Liqui Moly 10W-40 5 L',description:'Motoröl',currency:'EUR',price:'36,99'},
 {title:'Mobil 10W-40 1 Liter',description:'Motoröl',currency:'EUR',price:'9,99'},
 {title:'Shell 10W-40 5 Liter',description:'Motoröl',currency:'EUR',price:'32,50'}
];
let out=p.run('10W40 Motoröl',results,{facets:{minCoverage:.5,maxPrimary:6}});assert.equal(out.analysis.category,'automotive.motor_oil');assert.equal(out.results.length,4);assert.equal(out.results[0].attributes.volume.value,5);assert.equal(out.results[0].attributes.unit_price.unit,'EUR/l');assert.equal(out.results[0].attributes.unit_price.value,6.998);let ids=out.facets.primary.map(x=>x.id);assert.ok(ids.includes('brand'));assert.ok(ids.includes('viscosity'));assert.ok(ids.includes('volume'));assert.ok(ids.includes('price'));assert.ok(ids.includes('unit_price'));assert.ok(!ids.includes('approval'));assert.equal(out.quality.conflictMode,'fallback');
results=[...Array.from({length:14},(_,i)=>({title:`Bosch Akkuschrauber 18 V ${i+1}`,currency:'EUR',price:99+i})),...Array.from({length:5},(_,i)=>({title:`Makita Akkuschrauber 12 V ${i+1}`,currency:'EUR',price:79+i})),{title:'Akkuschrauber Set ohne Spannungsangabe',currency:'EUR',price:69}];out=p.run('Akkuschrauber 18V',results,{conflicts:{minKeep:12,minCleanRatio:.45},facets:{minCoverage:.35}});assert.equal(out.analysis.category,'tools.cordless_drill');assert.equal(out.quality.conflictMode,'strict');assert.equal(out.quality.suppressedCount,5);assert.equal(out.results.length,15);assert.ok(out.results.every(x=>!x.attributes.voltage||x.attributes.voltage.value===18));assert.equal(out.results[0].attributes.voltage.value,18);assert.ok(out.results[0].constraintMatch.score>0);ids=out.facets.primary.map(x=>x.id);assert.ok(ids.includes('voltage'));assert.ok(ids.includes('brand'));assert.ok(ids.includes('price'));
results=[{title:'Bosch Akkuschrauber 18 V',currency:'EUR',price:99},{title:'Makita Akkuschrauber 12 V',currency:'EUR',price:79},{title:'DeWalt Akkuschrauber 12 V',currency:'EUR',price:89},{title:'Metabo Akkuschrauber',currency:'EUR',price:69}];out=p.run('Akkuschrauber 18V',results,{conflicts:{minKeep:12,minCleanRatio:.45}});assert.equal(out.quality.conflictMode,'fallback');assert.equal(out.quality.suppressedCount,0);assert.equal(out.results.length,4);assert.equal(out.results[0].attributes.voltage.value,18);assert.ok(out.results.some(x=>x.attributes.voltage?.value===12),'thin-result fallback must preserve conflicting offers');
results=[{title:'Continental Winterreifen 205/55 R16',currency:'EUR',price:89},{title:'Michelin Winterreifen 205/55 R16',currency:'EUR',price:95},{title:'Goodyear Winterreifen 225/45 R17',currency:'EUR',price:99}];out=p.run('Winterreifen 205/55 R16',results,{conflicts:{minKeep:2,minCleanRatio:.5}});assert.equal(out.analysis.category,'automotive.tires');assert.equal(out.quality.conflictMode,'strict');assert.equal(out.quality.suppressedCount,1);assert.equal(out.results.length,2);assert.ok(out.results.every(x=>x.attributes.width.value===205&&x.attributes.aspect_ratio.value===55&&x.attributes.rim_size.value===16));ids=out.facets.primary.map(x=>x.id);assert.ok(ids.includes('width'));assert.ok(ids.includes('aspect_ratio'));assert.ok(ids.includes('rim_size'));
console.log('Product intelligence pipeline E2E: classify -> extract -> normalize -> rank -> safe conflict filter -> facets OK');
const evidenceCases=p.run('10W40 5 Liter',[
 {title:'Motoröl 10W40',url:'https://shop.example/product/high-star-10w-40-1-l',description:'Castrol 10W40 5 Liter',currency:'EUR',price:9.99},
 {title:'Castrol 10W40 5 Liter',url:'https://shop.example/product/castrol-10w-40-1-l',description:'Castrol 10W40 5 Liter',currency:'EUR',price:34.99},
 {title:'Castrol 10W40 5 Liter',url:'https://shop.example/product/castrol-10w-40-5-l',currency:'EUR',price:34.99}
]);
const urlQuantity=evidenceCases.results.find(x=>x.url.includes('high-star'));
assert.equal(urlQuantity.attributes.volume.value,1);assert.equal(urlQuantity.attributes.unit_price.value,9.99);assert.equal(urlQuantity.attributes.brand,undefined);assert.ok(urlQuantity.constraintMatch.conflicts>0,'1L URL must not match a 5L query via unrelated description');
const disputed=evidenceCases.results.find(x=>x.url.includes('castrol-10w-40-1-l'));
assert.equal(disputed.attributes.volume,undefined);assert.equal(disputed.attributes.normalized_quantity,undefined);assert.equal(disputed.attributes.unit_price,undefined,'normalizer cannot reintroduce disputed quantity from text');
assert.equal(evidenceCases.results[0].attributes.volume.value,5,'unambiguous exact offer ranks first');
const laptopCases=p.run('Lenovo Laptop 512 GB',[
 {title:'Lenovo Laptop 16 GB RAM 512 GB SSD',url:'https://shop.example/product/lenovo-laptop-16-gb-ram-512-gb-ssd',currency:'EUR',price:599},
 {title:'Lenovo PCs online kaufen',url:'https://shop.example/product/lenovo-thinkcentre-mini-pc-16-gb-ram-512-gb-ssd',currency:'EUR',price:399},
 {title:'Lenovo Desktop PC 512 GB SSD',url:'https://shop.example/product/desktop',currency:'EUR',price:299}
]);
assert.equal(laptopCases.results.length,1,'explicit desktop products do not fill laptop search fallback');assert.equal(laptopCases.quality.relevanceRejectedCount,2);assert.equal(laptopCases.quality.duplicateCount,0,'category exclusions are not counted as duplicates');assert.equal(laptopCases.results[0].attributes.storage.value,512);assert.equal(laptopCases.results[0].attributes.memory.value,16);assert.equal(laptopCases.results[0].constraintMatch.conflicts,0);
const phoneCases=p.run('Samsung Smartphone 256 GB',[{title:'Samsung Handy 256 GB',url:'https://shop.example/product/samsung-galaxy-a26-8256gb-black-256-gb',currency:'EUR',price:319}]);assert.equal(phoneCases.results[0].attributes.storage.value,256);assert.equal(phoneCases.results[0].constraintMatch.matched,2);assert.deepEqual(phoneCases.results[0].attributeConflicts,[]);

const snippetConflict=p.run('Akkuschrauber 18V',[...Array.from({length:14},(_,i)=>({title:`Bosch Akkuschrauber 18V Modell ${i+1}`})),{title:'Akkuschrauber Modell unbekannt',description:'Auch im Sortiment: Akkuschrauber 12V',url:'https://shop.example/product/unknown'},{title:'Makita Akkuschrauber 12V',url:'https://shop.example/product/12v'}]);
assert.equal(snippetConflict.quality.conflictMode,'strict');assert.equal(snippetConflict.quality.suppressedCount,1,'only the title-backed 12V conflict is suppressed');assert.ok(snippetConflict.results.some(item=>item.url==='https://shop.example/product/unknown'),'snippet conflict must remain available even when enough clean products exist');
