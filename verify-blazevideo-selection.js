'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {productionArtifactFor,assertProductionArtifact}=require('./merchant-production-artifact');
const {readProducts,requireHealth,validateReport}=require('./destination-link-health');
const {requireProductQuality,validateQualityReport}=require('./merchant-product-quality');
const key='blazevideo',contract=productionArtifactFor(key),products=readProducts(contract.source),approval=require('./production-merchant-approvals.json').merchants[key];
assertProductionArtifact(key,products,contract.source);
assert.equal(approval.advertiserId,'25962');assert.equal(approval.publisherId,'3106259');assert.equal(approval.network,'awin');
const rawReport=JSON.parse(fs.readFileSync('destination-health/blazevideo-clean-quality.json','utf8'));
const now=approval.approved===true?Date.now():Date.parse(rawReport.completedAt);
const report=approval.approved===true?requireProductQuality(key,products,approval):validateQualityReport(rawReport,{key,products,now});
if(approval.approved===true){assert.equal(approval.termsCleared,true);requireHealth(key,products,approval);}
else {const links=JSON.parse(fs.readFileSync('destination-health/blazevideo-clean-links.json','utf8'));validateReport(links,{key,products,now:Date.parse(links.completedAt)});}
assert.equal(products.length,16);
assert.equal(new Set(products.map(p=>p.rawAttributes.productFamilyId)).size,16);
assert.deepEqual(products.filter(p=>p.rawAttributes.model==='W600').map(p=>p.rawAttributes.productFamilyId).sort(),['W600-1-camera','W600-1-camera-solar-bundle','W600-2-camera']);
assert.deepEqual(products.filter(p=>p.rawAttributes.model==='A252').map(p=>p.rawAttributes.productFamilyId).sort(),['A252-1-camera','A252-1-camera-solar-bundle','A252-2-camera']);
for(const p of products){
 assert.equal(p.source.advertiserId,'25962');assert.equal(p.source.network,'awin');assert.equal(p.currency,'EUR');assert.equal(p.testData,false);
 assert.equal(p.inStock,null);assert.equal(p.availability,'UNKNOWN');assert.equal(p.shippingCost,null);assert.equal(p.deliveryDays,null);
 assert.equal(p.rawAttributes.liveVariantAvailable,true);
 const direct=new URL(p.directUrl),affiliate=new URL(p.affiliateUrl);
 assert.equal(direct.hostname,'www.blazevideos.de');assert(direct.pathname.startsWith('/products/'));
 assert.equal(affiliate.hostname,'www.awin1.com');assert.equal(affiliate.searchParams.get('a'),'3106259');assert.equal(affiliate.searchParams.get('m'),'25962');
 assert.equal(affiliate.searchParams.get('p'),p.rawAttributes.awinProductId);
 assert.equal(p.source.feedIds[0],'62725');
}
for(const mutate of [r=>r.results.pop(),r=>{r.results[0].image.decoded=false;},r=>{r.results[0].image.width=1;},r=>{r.results[0].variantId='wrong';},r=>{r.results[0].price++;},r=>{r.results[0].available=false;}]){
 const copy=structuredClone(report);mutate(copy);assert.throws(()=>validateQualityReport(copy,{key,products,now}));
}
assert.throws(()=>assertProductionArtifact(key,[{...products[0],price:1},...products.slice(1)],contract.source),/digest mismatch/);
assert.throws(()=>requireHealth(key,products,{approved:true},{allowLegacy:true}),/report required/);
assert.throws(()=>requireProductQuality(key,products,{}),/report required/);
if(approval.approved===true){
 const before=fs.readFileSync('production-merchant-approvals.json');
 try{
  for(const field of ['productQualityReport','termsCleared']){
   const config=JSON.parse(before);delete config.merchants[key][field];fs.writeFileSync('production-merchant-approvals.json',JSON.stringify(config));
   assert.throws(()=>require('node:child_process').execFileSync(process.execPath,['build-production-catalog.js','build/blazevideo-must-not-build'],{stdio:'pipe'}),error=>new RegExp(field==='termsCleared'?'reviewed terms required':'decoded-image and metadata report required').test(String(error.stderr)));
  }
 }finally{fs.writeFileSync('production-merchant-approvals.json',before);}
}
console.log('BlazeVideo selection gate OK: 16 unique families, real links/consent/images/metadata, variant and mutation rejection, honest unknown logistics');
