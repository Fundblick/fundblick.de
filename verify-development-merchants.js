'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {readProducts}=require('./destination-link-health.js');
const {assertProductionArtifact}=require('./merchant-production-artifact.js');
function catalog(dir){const manifest=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));const products=Object.values(manifest.shards).flatMap(s=>JSON.parse(fs.readFileSync(path.join(dir,s.file),'utf8')));assert.equal(products.length,manifest.itemCount);assert.equal(new Set(products.map(p=>p.id)).size,products.length);assert.equal(manifest.simulatedCount,0);assert.equal(manifest.dataMode,'real');return {manifest,products};}
function verify(baseDir,previewDir,profileFile){
 const baseline=catalog(baseDir),preview=catalog(previewDir),profile=JSON.parse(fs.readFileSync(profileFile,'utf8'));
 assert.equal(profile.version,1);assert.equal(profile.mode,'preview');
 const actual=new Map(preview.products.map(p=>[p.id,p]));const expectedIds=new Set(baseline.products.map(p=>p.id));
 for(const p of baseline.products)assert.deepEqual(actual.get(p.id),p,'Existing merchant changed in preview: '+p.id);
 let additions=0;
 for(const [key,a] of Object.entries(profile.merchants)){
  assert.equal(a.approved,true);assert.equal(a.termsCleared,true);assert.notEqual(a.quarantined,true);
  const products=a.sources.flatMap(readProducts);
  for(const source of a.sources)assertProductionArtifact(key,readProducts(source),source,{version:1,merchants:profile.artifacts});
  for(const p of products){
   assert(!expectedIds.has(p.id),'Duplicate preview identity');expectedIds.add(p.id);
   const live=actual.get(p.id);assert(live,'Missing preview product '+p.id);assert.equal(live.testData,false);assert.equal(live.simulatedOffers,false);
   for(const field of ['name','brand','price','currency','category','image','directUrl','affiliateUrl','inStock'])assert.deepEqual(live[field],p[field],p.id+' '+field);
   assert.equal(live.offers.length,1);assert.equal(live.bestOffer.merchantId,a.advertiserId);
  }
  additions+=products.length;
 }
 assert.equal(preview.products.length,baseline.products.length+additions);assert.deepEqual([...actual.keys()].sort(),[...expectedIds].sort());
 const categories=JSON.parse(fs.readFileSync(path.join(previewDir,'categories.json'),'utf8')).categories;
 assert.equal(categories.reduce((sum,c)=>sum+c.count,0),preview.products.length);
 console.log('Development catalog verified: '+baseline.products.length+' unchanged production products + '+additions+' fully qualified preview additions');
 return {baseline:baseline.products.length,additions,total:preview.products.length};
}
if(require.main===module)verify(...process.argv.slice(2));
module.exports={verify};
