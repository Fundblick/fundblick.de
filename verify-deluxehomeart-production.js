'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {readProducts,requireHealth}=require('./destination-link-health.js');
const {requireProductQuality}=require('./merchant-product-quality.js');
const {assertProductionArtifact,productionArtifactFor}=require('./merchant-production-artifact.js');
function verify(products){
 const approval=JSON.parse(fs.readFileSync('production-merchant-approvals.json','utf8')).merchants.deluxehomeart;
 assert(approval,'DeluxeHomeart production approval is missing');
 const contract=productionArtifactFor('deluxehomeart');
 assert.equal(contract.productCount,589,'Only the qualified 589 products may be promoted');
 assert.deepEqual(contract.categoryCounts,{'home.decor':548,'home.lighting':41});
 const sources=JSON.parse(fs.readFileSync('production-catalog-sources.json','utf8'));
 const selected=products.filter(p=>String(p.bestOffer?.merchantId)==='120411');
 if(approval.approved!==true){
  assert.equal(selected.length,0,'Blocked DeluxeHomeart leaked into catalog');
  assert(!sources.includes(contract.source),'Blocked DeluxeHomeart source remains active');
  return 0;
 }
 assert.notEqual(approval.quarantined,true,'Approved merchant must not be quarantined');
 assert.equal(approval.termsCleared,true);
 assert.equal(approval.network,'awin');assert.equal(approval.advertiserId,'120411');assert.equal(approval.publisherId,'3106259');
 assert.deepEqual(approval.sources,[contract.source]);
 assert.equal(sources.filter(s=>s===contract.source).length,1,'Qualified source must be included exactly once');
 const reviewed=readProducts(contract.source);
 assertProductionArtifact('deluxehomeart',reviewed,contract.source);
 requireHealth('deluxehomeart',reviewed,approval);requireProductQuality('deluxehomeart',reviewed,approval);
 assert.equal(selected.length,589,'DeluxeHomeart is missing from the actual catalog');
 assert.deepEqual(selected.map(p=>p.id).sort(),reviewed.map(p=>p.id).sort(),'Catalog must contain every qualified identity exactly once');
 const actual=new Map(selected.map(p=>[p.id,p]));
 for(const p of reviewed){
  const live=actual.get(p.id);
  for(const field of ['name','brand','price','currency','category','image','directUrl','affiliateUrl','inStock'])assert.deepEqual(live[field],p[field],p.id+' '+field);
  assert.equal(live.offers.length,1);assert.equal(live.bestOffer.merchant,'Deluxehomeartshop DE');
  assert.equal(live.bestOffer.network,'awin');assert.equal(live.bestOffer.directUrl,p.directUrl);assert.equal(live.bestOffer.affiliateUrl,p.affiliateUrl);
  assert.equal(live.testData,false);assert.equal(live.simulatedOffers,false);
 }
 console.log('DeluxeHomeart production verified: all 589 reviewed identities, source facts, images and consent destinations');
 return selected.length;
}
if(require.main===module){const root=process.argv[2]||'build/catalog',m=JSON.parse(fs.readFileSync(path.join(root,'manifest.json')));verify(Object.values(m.shards).flatMap(s=>JSON.parse(fs.readFileSync(path.join(root,s.file)))));}
module.exports={verify};
