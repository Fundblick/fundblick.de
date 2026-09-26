'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {registry}=require('./taxonomy-registry.js');

const sourceFiles=['development/ahipos-products-1.json','development/ahipos-products-2.json'];
const rows=sourceFiles.flatMap(file=>JSON.parse(fs.readFileSync(file,'utf8')));
assert.equal(rows.length,31,'AHIPOS must contribute exactly 31 unique variants');
assert.equal(new Set(rows.map(x=>x.id)).size,31,'catalog IDs must be unique');
assert.equal(new Set(rows.map(x=>x.merchantVariantId)).size,31,'merchant variant IDs must be unique');
assert.equal(new Set(rows.map(x=>x.productGroupId)).size,25,'25 product groups must be preserved');
const counts=rows.reduce((m,x)=>(m[x.category]=(m[x.category]||0)+1,m),{});
assert.deepEqual(counts,{'pet.equestrian':29,'pet.dog':1,'health.supplements':1});
assert(rows.every(x=>x.source?.network==='awin'&&x.source?.advertiserId==='120341'),'source provenance must remain Awin/120341');
assert(rows.every(x=>x.testData===false&&x.active===true),'AHIPOS rows must be real active catalog rows');
assert(rows.every(x=>!String(x.category).startsWith('home.')),'AHIPOS must never fall back to Casa-Moro home families');
assert.equal(rows.filter(x=>x.rawAttributes?.availabilityConflict).length,2,'two availability conflicts must stay flagged');
assert(rows.filter(x=>x.rawAttributes?.availabilityConflict).every(x=>x.inStock===false&&x.availability==='OUT_OF_STOCK'),'availability conflicts must remain conservative');
assert.equal(rows.filter(x=>x.shippingCost===null).length,3,'retail-only variants must keep unknown shipping instead of invented free shipping');
assert.equal(rows.filter(x=>x.category==='pet.equestrian'&&x.rawAttributes?.productType==='Pferdepflege').length,3,'horse-care products must stay factual care products');
assert(registry.families.equestrian,'canonical equestrian family missing');
assert.deepEqual(registry.families.equestrian.types,['Ergänzungsfutter','Pferdepflege','Bundle']);

const buildDir=process.argv[2]||path.join('build','ahipos-catalog');
if(fs.existsSync(path.join(buildDir,'manifest.json'))){
  const manifest=JSON.parse(fs.readFileSync(path.join(buildDir,'manifest.json'),'utf8'));
  const products=[];
  for(const entry of Object.values(manifest.shards||{})){
    const payload=JSON.parse(fs.readFileSync(path.join(buildDir,entry.file),'utf8'));
    if(Array.isArray(payload))products.push(...payload);
  }
  const ahipos=products.filter(x=>x?.source?.advertiserId==='120341');
  assert.equal(ahipos.length,31,'built catalog must contain all 31 AHIPOS variants exactly once');
  assert.equal(new Set(ahipos.map(x=>x.id)).size,31,'built catalog must not duplicate AHIPOS variants');
  assert(ahipos.every(x=>x.simulatedOffers===false&&x.testData===false),'AHIPOS offers must never be simulated');
  assert.equal(manifest.realCount,manifest.itemCount,'combined development catalog must remain real-only');
}
console.log('AHIPOS_CATALOG_INTEGRATION_GREEN',JSON.stringify({variants:rows.length,groups:new Set(rows.map(x=>x.productGroupId)).size,categories:counts}));
